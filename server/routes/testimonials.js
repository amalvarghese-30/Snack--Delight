// server/routes/testimonials.js - COMPLETE FIXED VERSION
import express from 'express';
import path from 'path';
import fs from 'fs';
import Testimonial from '../models/Testimonial.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============
// Get all active testimonials for website
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true })
            .sort('order')
            .select('-__v');

        res.json({
            success: true,
            count: testimonials.length,
            testimonials
        });
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch testimonials'
        });
    }
});

// Get random testimonials
router.get('/random', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const testimonials = await Testimonial.aggregate([
            { $match: { isActive: true } },
            { $sample: { size: limit } }
        ]);

        res.json({
            success: true,
            count: testimonials.length,
            testimonials
        });
    } catch (error) {
        console.error('Error fetching random testimonials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch testimonials'
        });
    }
});

// ============ ADMIN ROUTES ============
// Get all testimonials (admin only)
router.get('/all', protect, admin, async (req, res) => {
    try {
        const testimonials = await Testimonial.find()
            .sort('-createdAt')
            .select('-__v');

        res.json({
            success: true,
            count: testimonials.length,
            testimonials
        });
    } catch (error) {
        console.error('Error fetching all testimonials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch testimonials'
        });
    }
});

// Get single testimonial
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        res.json({
            success: true,
            testimonial
        });
    } catch (error) {
        console.error('Error fetching testimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch testimonial'
        });
    }
});

// Upload testimonial image
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
        const fileName = `testimonial_${timestamp}_${sanitizedName}`;

        const uploadsDir = path.join(process.cwd(), 'uploads', 'testimonials');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const uploadPath = path.join(uploadsDir, fileName);
        await image.mv(uploadPath);

        const imageUrl = `/uploads/testimonials/${fileName}`;
        res.json({ imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image: ' + error.message });
    }
});

// Create testimonial
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, location, content, rating, image, order, isActive } = req.body;

        // Validation
        if (!name || !location || !content) {
            return res.status(400).json({
                success: false,
                message: 'Name, location, and content are required'
            });
        }

        const testimonial = await Testimonial.create({
            name,
            location,
            content,
            rating: rating || 5,
            image: image || '',
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            testimonial
        });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create testimonial'
        });
    }
});

// Update testimonial
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, location, content, rating, image, order, isActive } = req.body;

        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        // Update fields
        testimonial.name = name || testimonial.name;
        testimonial.location = location || testimonial.location;
        testimonial.content = content || testimonial.content;
        testimonial.rating = rating !== undefined ? rating : testimonial.rating;
        testimonial.image = image !== undefined ? image : testimonial.image;
        testimonial.order = order !== undefined ? order : testimonial.order;
        testimonial.isActive = isActive !== undefined ? isActive : testimonial.isActive;

        await testimonial.save();

        res.json({
            success: true,
            message: 'Testimonial updated successfully',
            testimonial
        });
    } catch (error) {
        console.error('Error updating testimonial:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update testimonial'
        });
    }
});

// Delete testimonial
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        await testimonial.deleteOne();

        res.json({
            success: true,
            message: 'Testimonial deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete testimonial'
        });
    }
});

// Bulk reorder testimonials
router.post('/bulk-reorder', protect, admin, async (req, res) => {
    try {
        const { orders } = req.body;

        const updates = orders.map(({ id, order }) =>
            Testimonial.findByIdAndUpdate(id, { order }, { new: true })
        );

        await Promise.all(updates);

        res.json({
            success: true,
            message: 'Testimonials reordered successfully'
        });
    } catch (error) {
        console.error('Error reordering testimonials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reorder testimonials'
        });
    }
});

export default router;