import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2000; // Max width/height in pixels

// Check for malicious content patterns
const hasMaliciousContent = (buffer) => {
    const suspiciousPatterns = [
        '<script', 'javascript:', 'data:text/html', '<?php', '<%', '<%=',
        'eval(', 'exec(', 'system(', 'base64_decode'
    ];

    const bufferString = buffer.toString().toLowerCase();
    return suspiciousPatterns.some(pattern => bufferString.includes(pattern));
};

export async function validateImageUpload(req, res, next) {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    const image = req.files.image;

    // Check file size
    if (image.size > MAX_FILE_SIZE) {
        return res.status(400).json({
            message: `File too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        });
    }

    // Check for malicious content
    if (hasMaliciousContent(image.data)) {
        console.error('Malicious content detected in upload');
        return res.status(400).json({ message: 'Invalid file content' });
    }

    // Verify actual file type using magic numbers
    const detectedType = await fileTypeFromBuffer(image.data);
    if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
        return res.status(400).json({
            message: 'Invalid file type. Allowed: JPEG, PNG, WEBP'
        });
    }

    // Verify image dimensions and compress using Sharp
    try {
        const metadata = await sharp(image.data).metadata();

        if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
            return res.status(400).json({
                message: `Image dimensions too large. Max ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}px`
            });
        }

        // Compress and optimize image
        let optimizedBuffer;
        if (detectedType.mime === 'image/jpeg') {
            optimizedBuffer = await sharp(image.data)
                .jpeg({ quality: 80, progressive: true })
                .toBuffer();
        } else if (detectedType.mime === 'image/png') {
            optimizedBuffer = await sharp(image.data)
                .png({ quality: 80, compressionLevel: 9 })
                .toBuffer();
        } else {
            optimizedBuffer = await sharp(image.data)
                .webp({ quality: 80 })
                .toBuffer();
        }

        // Generate sanitized filename
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = detectedType.ext;
        const sanitizedName = `${timestamp}_${randomString}.${extension}`;

        // Store optimized buffer
        req.validatedImage = {
            ...image,
            data: optimizedBuffer,
            sanitizedName,
            originalName: image.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
            size: optimizedBuffer.length,
            mimeType: detectedType.mime
        };

        next();
    } catch (error) {
        console.error('Image processing error:', error);
        return res.status(400).json({ message: 'Invalid or corrupted image file' });
    }
}

// Clean up old unused images (run this periodically)
export async function cleanupOldImages(uploadsDir, maxAgeHours = 24) {
    try {
        const files = await fs.promises.readdir(uploadsDir);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            const stats = await fs.promises.stat(filePath);
            const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);

            if (ageHours > maxAgeHours) {
                // Check if image is referenced in any product
                // This requires checking the database - implement as needed
                await fs.promises.unlink(filePath);
                console.log(`Cleaned up old image: ${file}`);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}