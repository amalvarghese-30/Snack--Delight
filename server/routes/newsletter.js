// server/routes/newsletter.js
import express from 'express';
import Newsletter from '../models/Newsletter.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Subscribe (public)
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        await Newsletter.create({ email });
        res.json({ message: 'Subscribed successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unsubscribe (public)
router.post('/unsubscribe', async (req, res) => {
    try {
        const { email } = req.body;
        await Newsletter.findOneAndUpdate({ email }, { isActive: false });
        res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all subscribers - FIXED: NOW ADMIN PROTECTED
router.get('/', protect, admin, async (req, res) => {
    try {
        const subscribers = await Newsletter.find({ isActive: true }).sort('-subscribedAt');
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete subscriber - ADMIN ONLY
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Newsletter.findByIdAndDelete(req.params.id);
        res.json({ message: 'Subscriber deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;