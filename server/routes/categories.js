// server/routes/categories.js
import express from 'express';
import Category from '../models/Category.js';
import { protect, admin } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort('order');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all categories (admin - includes inactive)
router.get('/all', protect, admin, async (req, res) => {
    try {
        const categories = await Category.find().sort('order');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single category
router.get('/:slug', async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload category image
router.post('/upload-image', protect, admin, async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const image = req.files.image;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' });
        }

        const timestamp = Date.now();
        const sanitizedName = image.name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const fileName = `${timestamp}_${sanitizedName}`;

        const uploadsDir = path.join(process.cwd(), 'uploads', 'categories');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const uploadPath = path.join(uploadsDir, fileName);
        await image.mv(uploadPath);

        const imageUrl = `/uploads/categories/${fileName}`;
        res.json({ imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image: ' + error.message });
    }
});

// Admin: Create category
router.post('/', protect, admin, async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Update category
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Delete category
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;