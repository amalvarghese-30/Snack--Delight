import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Note: Cart is handled client-side with Zustand
// These endpoints are for syncing cart with server if needed

// Sync cart to server
router.post('/sync', protect, async (req, res) => {
    try {
        // In a real app, you'd store cart in a separate Cart model
        // For now, just acknowledge
        res.json({ message: 'Cart synced', items: req.body.items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get saved cart
router.get('/', protect, async (req, res) => {
    try {
        // Return empty for now - cart stored client-side
        res.json({ items: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;