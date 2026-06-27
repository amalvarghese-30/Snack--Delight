import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

// Check for malicious content patterns
const hasMaliciousContent = (buffer) => {
    const suspiciousPatterns = [
        '<script',
        'javascript:',
        'data:text/html',
        '<?php',
        '<%',
        '<%=',
        'eval(',
        'exec(',
        'system(',
        'base64_decode'
    ];

    const bufferString = buffer.toString().toLowerCase();
    return suspiciousPatterns.some(pattern => bufferString.includes(pattern));
};

export async function validateImageUpload(req, res, next) {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                message: 'No image file uploaded'
            });
        }

        const image = req.files.image;

        // Check file size
        if (image.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                message: `File too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
        }

        // Check malicious content
        if (hasMaliciousContent(image.data)) {
            console.error('Malicious content detected.');
            return res.status(400).json({
                message: 'Invalid file content'
            });
        }

        // Verify actual file type
        const detectedType = await fileTypeFromBuffer(image.data);

        if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
            return res.status(400).json({
                message: 'Invalid file type. Allowed: JPEG, PNG, WEBP'
            });
        }

        // Generate safe filename
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const sanitizedName = `${timestamp}_${randomString}.${detectedType.ext}`;

        // Pass original image through (no Sharp processing)
        req.validatedImage = {
            ...image,
            sanitizedName,
            originalName: image.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
            size: image.size,
            mimeType: detectedType.mime
        };

        next();

    } catch (error) {
        console.error('Upload validation error:', error);

        return res.status(400).json({
            message: 'Invalid or corrupted image file'
        });
    }
}

// Clean up old unused images
export async function cleanupOldImages(uploadsDir, maxAgeHours = 24) {
    try {
        const files = await fs.promises.readdir(uploadsDir);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            const stats = await fs.promises.stat(filePath);

            const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);

            if (ageHours > maxAgeHours) {
                await fs.promises.unlink(filePath);
                console.log(`Deleted old image: ${file}`);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}
