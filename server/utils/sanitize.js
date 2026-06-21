// server/utils/sanitize.js

export const sanitizeSearchQuery = (query) => {
    if (!query) return '';

    // Remove special characters that could affect MongoDB text search
    return query
        .trim()
        .replace(/[^\w\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 100); // Limit length
};

export const sanitizeSlug = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')  // Remove special characters
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .replace(/--+/g, '-')       // Replace multiple hyphens
        .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
};

export const sanitizeEmail = (email) => {
    if (!email) return '';
    return email.toLowerCase().trim().substring(0, 255);
};