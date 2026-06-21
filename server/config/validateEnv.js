// server/config/validateEnv.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.join(__dirname, '../..', '.env') });

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
];

export function validateEnv() {
    const missing = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(env => console.error(`   - ${env}`));
        console.error('\n💡 Please add these to your .env file');
        process.exit(1);
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️ Warning: JWT_SECRET should be at least 32 characters long');
    }

    // Validate MongoDB URI format
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mongodb')) {
        console.error('❌ Invalid MONGODB_URI format');
        process.exit(1);
    }

    console.log('✅ Environment variables validated');

    return {
        isProduction: process.env.NODE_ENV === 'production',
        port: parseInt(process.env.PORT) || 5000,
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
    };
}