import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import cartRoutes from './routes/cart.js';
import newsletterRoutes from './routes/newsletter.js';
import { errorHandler } from './middleware/errorHandler.js';
import contactRoutes from './routes/contact.js';
import fileUpload from 'express-fileupload';
import { createIndexes } from './config/indexes.js';
import testimonialRoutes from './routes/testimonials.js';
import { validateEnv } from './config/validateEnv.js';
import csrfProtection, { csrfTokenHandler, csrfErrorHandler } from './middleware/csrf.js';
import Logger from './config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
dotenv.config();

// Validate environment variables
const envConfig = validateEnv();
const PORT = envConfig.port;
const isProduction = envConfig.isProduction;

const app = express();

// Connect to MongoDB and create indexes
const startServer = async () => {
    try {
        await connectDB();
        await createIndexes();
        Logger.info('✅ Database ready');
    } catch (error) {
        Logger.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

startServer();

// ============ LOGGING MIDDLEWARE ============
// Request logging middleware (add this BEFORE other middleware)
app.use((req, res, next) => {
    const start = Date.now();

    // Log on finish
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'http';
        Logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);

        // Log slow requests (> 1 second)
        if (duration > 1000) {
            Logger.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
        }
    });

    next();
});

// ============ RATE LIMITING ============
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});

const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many orders placed. Please try again later.',
    skipSuccessfulRequests: true,
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: 'Too many contact form submissions. Please try again later.',
});

const newsletterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many subscription attempts. Please try again later.',
});

// ============ CORS CONFIGURATION ============
const allowedOrigins = envConfig.allowedOrigins;

// CORS middleware
app.use(cors({
    origin: isProduction ? (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
            callback(null, true);
        } else {
            Logger.warn(`Blocked CORS request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    } : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Idempotency-Key'],
    exposedHeaders: ['X-CSRF-Token']
}));

// ============ HTTPS ENFORCEMENT ============
app.use((req, res, next) => {
    const isHttps = req.headers['x-forwarded-proto'] === 'https';
    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

    if (!isHttps && isProduction && !isLocalhost) {
        Logger.info(`Redirecting to HTTPS: ${req.url}`);
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
});

// ============ HELMET SECURITY ============
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://checkout.razorpay.com", "https://www.google.com", "https://www.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http:", "https://images.pexels.com", "https://via.placeholder.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", isProduction ? process.env.FRONTEND_URL || '' : 'http://localhost:5173', "https://api.razorpay.com"],
            frameSrc: ["'self'", "https://api.razorpay.com"],
            upgradeInsecureRequests: isProduction ? [] : null,
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ============ BODY PARSERS ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============ FILE UPLOAD CONFIGURATION ============
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: envConfig.maxFileSize },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limitHandler: (req, res) => {
        Logger.warn(`File upload too large from IP: ${req.ip}`);
        res.status(400).json({
            message: `File too large. Max size is ${envConfig.maxFileSize / (1024 * 1024)}MB`
        });
    }
}));

// ============ STATIC FILES ============
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath, {
    maxAge: '7d',
    setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'public, max-age=604800');
    }
}));
Logger.info(`📁 Serving uploads from: ${uploadsPath}`);

// ============ CSRF PROTECTION ============
// CSRF token endpoint (always generates a token + cookie)
app.get('/api/csrf-token', csrfProtection, csrfTokenHandler);

// Apply CSRF protection to state-changing endpoints
app.use('/api/auth/login', csrfProtection);
app.use('/api/auth/register', csrfProtection);
app.use('/api/auth/logout', csrfProtection);
app.use('/api/auth/change-password', csrfProtection);
app.use('/api/auth/forgot-password', csrfProtection);
app.use('/api/auth/reset-password/:token', csrfProtection);
app.use('/api/orders', csrfProtection);
app.use('/api/contact/submit', csrfProtection);
app.use('/api/newsletter/subscribe', csrfProtection);
app.use('/api/products', csrfProtection);
app.use('/api/categories', csrfProtection);
app.use('/api/testimonials', csrfProtection);

// ============ RATE LIMITING APPLICATION ============
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/orders', orderLimiter);
app.use('/api/contact/submit', contactLimiter);
app.use('/api/newsletter/subscribe', newsletterLimiter);

// ============ ROUTES ============
// Public routes (no CSRF needed for GET)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialRoutes);

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        environment: isProduction ? 'production' : 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
    Logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});

// ============ CSRF ERROR HANDLER ============
app.use(csrfErrorHandler);

// ============ GLOBAL ERROR HANDLER ============
app.use(errorHandler);

// ============ GRACEFUL SHUTDOWN ============
const gracefulShutdown = async (signal) => {
    Logger.info(`${signal} received. Starting graceful shutdown...`);

    const server = app.listen(PORT);

    server.close(async () => {
        Logger.info('HTTP server closed');

        try {
            await mongoose.connection.close();
            Logger.info('MongoDB connection closed');

            Logger.info('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            Logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    });

    // Force close after 10 seconds
    setTimeout(() => {
        Logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't crash in production, just log
    if (!isProduction) {
        process.exit(1);
    }
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    // In production, log and exit gracefully
    if (!isProduction) {
        process.exit(1);
    }
});

// ============ START SERVER ============
const server = app.listen(PORT, () => {
    Logger.info(`🚀 Server running on port ${PORT}`);
    Logger.info(`📦 Environment: ${isProduction ? 'production' : 'development'}`);
    Logger.info(`🔒 CORS: ${isProduction ? 'restricted' : 'open'}`);
    Logger.info(`🛡️  CSRF Protection: Enabled for state-changing endpoints`);
    Logger.info(`📝 Logging: ${isProduction ? 'File + Console' : 'Console'}`);
});

export default app;