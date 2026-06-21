// server/routes/contact.js (updated)
import express from 'express';
import { sendContactNotification } from '../config/email.js';

const router = express.Router();

router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Send email notification
        await sendContactNotification({ name, email, subject, message });

        console.log('Contact form submission:', { name, email, subject, message });

        res.json({ message: 'Message sent successfully! We will get back to you soon.' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;