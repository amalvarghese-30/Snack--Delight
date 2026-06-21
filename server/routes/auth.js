// server/routes/auth.js - COMPLETE UPDATED VERSION
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, admin, blacklistToken } from '../middleware/auth.js';
import crypto from 'crypto';
import { sendEmail } from '../config/email.js';

const router = express.Router();

// Forgot password - request reset (FIXED - email actually sends)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal that user doesn't exist for security
            return res.json({ message: 'If an account exists, a password reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Send email with reset link
        const emailSent = await sendEmail(
            user.email,
            'Password Reset Request - Snacks Delight',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #D4AF37;">Reset Your Password</h2>
                <p>You requested a password reset for your Snacks Delight account.</p>
                <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                <a href="${resetUrl}" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 30px; display: inline-block; margin: 20px 0;">
                    Reset Password
                </a>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="border-color: #333;">
                <p style="font-size: 12px; color: #666;">Snacks Delight - Premium Dry Fruits & Gourmet Snacks</p>
            </div>
            `,
            `Reset your password using this link: ${resetUrl}`
        );

        res.json({ message: 'If an account exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Could not process request. Please try again later.' });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.mustChangePassword = false;
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        // Send welcome email
        try {
            await sendEmail(
                user.email,
                'Welcome to Snacks Delight!',
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #D4AF37;">Welcome to Snacks Delight!</h2>
                    <p>Thank you for joining our community, ${name}!</p>
                    <p>You now have access to premium dry fruits and gourmet snacks sourced from around the world.</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop" style="background: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 30px; display: inline-block; margin: 20px 0;">
                        Start Shopping
                    </a>
                </div>
                `
            );
        } catch (emailError) {
            console.error('Welcome email failed:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
            mustChangePassword: user.mustChangePassword,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Login (WITH ACCOUNT LOCKOUT)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if account is locked
        if (user.isLocked()) {
            const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / 60000);
            return res.status(401).json({
                message: `Account is temporarily locked. Try again in ${minutesLeft} minutes.`
            });
        }

        // Check if user is active
        if (user.isActive === false) {
            return res.status(401).json({ message: 'Account has been deactivated. Please contact support.' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            await user.incrementFailedLogins();
            const attemptsLeft = 5 - user.failedLoginAttempts;
            return res.status(401).json({
                message: `Invalid email or password. ${attemptsLeft} attempts remaining.`
            });
        }

        // Reset failed login attempts on successful login
        await user.resetFailedLogins();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
            mustChangePassword: user.mustChangePassword,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Change password (for mustChangePassword flag)
router.post('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Logout endpoint
router.post('/logout', protect, async (req, res) => {
    try {
        blacklistToken(req.token);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users (Admin only)
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password -resetPasswordToken -resetPasswordExpire');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user role (Admin only)
router.put('/users/:id/role', protect, admin, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent removing last admin
        if (user.role === 'admin' && role === 'user') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot remove last admin user' });
            }
        }

        user.role = role;
        await user.save();

        res.json({ message: 'User role updated', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete user (Admin only - soft delete)
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete last admin user' });
            }
        }

        // Soft delete
        user.isActive = false;
        await user.save();

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get current user
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

export default router;