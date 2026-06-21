// server/middleware/csrf.js - UPDATED
import csurf from 'csurf';
import cookieParser from 'cookie-parser';

// CSRF protection middleware
const csrfProtection = csurf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Generate CSRF token endpoint
export const csrfTokenHandler = (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
};

// CSRF error handler
export const csrfErrorHandler = (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            message: 'Invalid CSRF token. Please refresh the page and try again.'
        });
    }
    next(err);
};

export default csrfProtection;