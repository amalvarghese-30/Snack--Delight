// server/routes/orders.js - COMPLETE WITH TRANSACTIONS
import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { sendOrderConfirmation } from '../config/email.js';

const router = express.Router();

// Add near the top of orders.js
const processedIdempotencyKeys = new Map(); // In production, use Redis

const checkIdempotency = async (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
        return next();
    }

    if (processedIdempotencyKeys.has(idempotencyKey)) {
        return res.status(409).json({
            message: 'Duplicate request detected',
            order: processedIdempotencyKeys.get(idempotencyKey)
        });
    }

    next();
};

// Apply to order creation route
router.post('/', protect, checkIdempotency, async (req, res) => {
    // ... existing order creation code ...

    // After successful order creation
    const idempotencyKey = req.headers['idempotency-key'];
    if (idempotencyKey) {
        processedIdempotencyKeys.set(idempotencyKey, order);
        // Clean up after 24 hours
        setTimeout(() => processedIdempotencyKeys.delete(idempotencyKey), 24 * 60 * 60 * 1000);
    }
});
// Create order with atomic operations (TRANSACTION SUPPORT)
router.post('/', protect, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

        // Validate items exist
        if (!items || items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'No items in order' });
        }

        // Validate total matches
        let calculatedTotal = 0;
        for (const item of items) {
            calculatedTotal += item.price * item.quantity;
        }

        if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Total amount mismatch' });
        }

        // Verify and update stock atomically
        const stockUpdates = [];

        for (const item of items) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `${item.name} not found` });
            }

            if (product.stock < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message: `${item.name} is out of stock (only ${product.stock} left)`
                });
            }

            // Update stock atomically with $inc
            const updated = await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } },
                { session, new: true }
            );

            if (!updated || updated.stock < 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `Failed to update stock for ${item.name}` });
            }

            stockUpdates.push(updated);
        }

        // Generate unique order number
        const orderNumber = `SD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create order
        const [order] = await Order.create([{
            orderNumber,
            user: req.user._id,
            items: items.map(item => ({
                ...item,
                product: item.product,
            })),
            shippingAddress,
            paymentMethod,
            totalAmount,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            orderStatus: 'pending',
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // Send order confirmation email (don't await - don't block response)
        sendOrderConfirmation(order, req.user).catch(err => {
            console.error('Failed to send order confirmation:', err);
        });

        res.status(201).json({
            success: true,
            order: order,
            message: 'Order placed successfully'
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort('-createdAt')
            .select('-__v');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get all orders with pagination
router.get('/', protect, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find()
                .populate('user', 'name email')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            Order.countDocuments()
        ]);

        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Update order status
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const { trackingNumber } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // If order is already delivered or cancelled, prevent changes
        if (order.orderStatus === 'delivered') {
            return res.status(400).json({ message: 'Cannot change status of delivered order' });
        }

        if (order.orderStatus === 'cancelled') {
            return res.status(400).json({ message: 'Cannot change status of cancelled order' });
        }

        // If cancelling, restore stock
        if (status === 'cancelled' && order.orderStatus !== 'cancelled') {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: item.quantity } },
                        { session }
                    );
                }
                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        }

        order.orderStatus = status;
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        await order.save();

        res.json({
            success: true,
            order,
            message: `Order status updated to ${status}`
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Admin: Update payment status
router.put('/:id/payment', protect, admin, async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        const validStatuses = ['pending', 'completed', 'failed'];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        res.json({
            success: true,
            order,
            message: `Payment status updated to ${paymentStatus}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;