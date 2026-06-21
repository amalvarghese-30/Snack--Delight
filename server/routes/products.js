// server/routes/products.js
import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { validateProduct } from '../middleware/validate.js';
import { validateImageUpload } from '../middleware/uploadValidator.js';
import { sanitizeSearchQuery } from '../utils/sanitize.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Get all products with pagination
router.get('/', async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            page = 1,
            limit = 20,
            sort = '-createdAt'
        } = req.query;

        let query = { isActive: true };

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            const sanitized = sanitizeSearchQuery(search);
            if (sanitized) {
                query.$text = { $search: sanitized };
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Product.countDocuments(query)
        ]);

        res.json({
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage: parseInt(page) * parseInt(limit) < total,
                hasPrevPage: parseInt(page) > 1,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single product
router.get('/:slug', async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPLOAD IMAGE ENDPOINT - With validation
router.post('/upload-image', protect, admin, validateImageUpload, async (req, res) => {
    try {
        const { image, sanitizedName } = req.validatedImage;

        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('📁 Created uploads directory at:', uploadsDir);
        }

        const uploadPath = path.join(uploadsDir, sanitizedName);
        await image.mv(uploadPath);

        // Log upload for audit
        console.log(`📁 Image uploaded: ${sanitizedName} by user: ${req.user._id}`);

        const imageUrl = `/uploads/${sanitizedName}`;
        res.json({ imageUrl, filename: sanitizedName });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image: ' + error.message });
    }
});

// Admin: Create product (with validation)
router.post('/', protect, admin, validateProduct, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Update product (with validation)
router.put('/:id', protect, admin, validateProduct, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Delete product
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;