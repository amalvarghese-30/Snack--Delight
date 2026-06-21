import { z } from 'zod';

// Product validation schema
const productSchema = z.object({
    name: z.string().min(3).max(100),
    slug: z.string().min(3).max(100),
    tagline: z.string().max(200).optional(),
    description: z.string().min(20).max(2000),
    price: z.coerce.number().positive().min(0.01).max(10000),
    category: z.string().min(2).max(50),
    image: z.string().optional(),
    stock: z.coerce.number().int().min(0).max(999999),
    benefits: z.array(z.string()).max(10).optional(),
    isActive: z.boolean().default(true),
});

// Order validation schema
const orderSchema = z.object({
    items: z.array(z.object({
        product: z.string(),
        name: z.string(),
        price: z.number().positive(),
        quantity: z.number().int().min(1).max(999),
        image: z.string().optional(),
    })).min(1).max(50),
    shippingAddress: z.object({
        street: z.string().min(5).max(200),
        city: z.string().min(2).max(100),
        state: z.string().min(2).max(100),
        zipCode: z.string().min(3).max(20),
        country: z.string().min(2).max(100),
    }),
    paymentMethod: z.enum(['razorpay', 'stripe', 'cod']),
    totalAmount: z.number().positive(),
});

// Contact validation
const contactSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    subject: z.string().min(3).max(200),
    message: z.string().min(10).max(2000),
});

// Newsletter validation
const newsletterSchema = z.object({
    email: z.string().email(),
});

// Validate middleware
export const validateProduct = (req, res, next) => {
    try {
        productSchema.parse(req.body);
        next();
    } catch (error) {
        res.status(400).json({
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateOrder = (req, res, next) => {
    try {
        orderSchema.parse(req.body);
        next();
    } catch (error) {
        res.status(400).json({
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateContact = (req, res, next) => {
    try {
        contactSchema.parse(req.body);
        next();
    } catch (error) {
        res.status(400).json({
            message: 'Validation failed',
            errors: error.errors
        });
    }
};

export const validateNewsletter = (req, res, next) => {
    try {
        newsletterSchema.parse(req.body);
        next();
    } catch (error) {
        res.status(400).json({
            message: 'Validation failed',
            errors: error.errors
        });
    }
};