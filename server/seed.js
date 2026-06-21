// server/seed.js - Updated secure version
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Testimonial from './models/Testimonial.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file!');
    process.exit(1);
}

// Generate secure random password for admin (only in development)
const generateSecurePassword = () => {
    return crypto.randomBytes(12).toString('hex');
};

const seedDatabase = async () => {
    try {
        console.log('🚀 Starting database seeding...');
        console.log('🔌 Connecting to MongoDB Atlas...');

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ Connected to MongoDB Atlas');

        const isProduction = process.env.NODE_ENV === 'production';

        // ========== SEED ADMIN (SECURE VERSION) ==========
        console.log('\n📝 Setting up admin user...');

        let adminPassword = process.env.ADMIN_PASSWORD;

        // In development, generate or use env variable
        if (!isProduction && !adminPassword) {
            adminPassword = generateSecurePassword();
            console.log('\n⚠️  DEVELOPMENT MODE');
            console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL || 'admin@snackdelight.com'}`);
            console.log(`🔑 Admin Password: ${adminPassword}`);
            console.log('📝 SAVE THIS PASSWORD!\n');
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@snackdelight.com';

        let adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(adminPassword || generateSecurePassword(), salt);

            adminUser = await User.create({
                name: "Administrator",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                mustChangePassword: !isProduction, // Force password change in dev
            });
            console.log("✅ Admin user created!");
        } else if (!isProduction) {
            // In development, reset password if needed
            console.log("⚠️ Admin user already exists");
            console.log("💡 To reset admin password, delete the admin user and re-run seed");
        }

        // ========== SEED CATEGORIES ==========
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const categories = [
                { name: "Almonds", slug: "almonds", order: 1, isActive: true },
                { name: "Cashews", slug: "cashews", order: 2, isActive: true },
                { name: "Pistachios", slug: "pistachios", order: 3, isActive: true },
                { name: "Dates", slug: "dates", order: 4, isActive: true },
                { name: "Trail Mixes", slug: "trail-mixes", order: 5, isActive: true },
                { name: "Healthy Snacks", slug: "healthy-snacks", order: 6, isActive: true },
            ];
            await Category.insertMany(categories);
            console.log(`✅ Created ${categories.length} categories`);
        }

        // ========== SEED PRODUCTS ==========
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            const products = [
                {
                    name: "Premium California Almonds",
                    slug: "california-almonds",
                    tagline: "Buttery, slow-roasted, single-origin",
                    description: "Hand-selected from the heart of California's Central Valley. These almonds are slow-roasted to bring out a deeply nutty, buttery character.",
                    price: 24.99,
                    category: "Almonds",
                    image: "https://images.pexels.com/photos/57042/almonds-nuts-almond-close-up-57042.jpeg?w=400",
                    stock: 250,
                    rating: 4.9,
                    benefits: ["Rich in Vitamin E", "Heart-healthy fats", "Plant-based protein"],
                    isActive: true,
                },
                {
                    name: "Premium Roasted Cashews",
                    slug: "roasted-cashews",
                    tagline: "Whole, golden, lightly salted",
                    description: "Plump whole cashews kissed with sea salt and roasted to a delicate amber. Creamy, buttery, and irresistibly smooth.",
                    price: 22.99,
                    category: "Cashews",
                    image: "https://images.pexels.com/photos/1078354/cashews-nuts-snack-healthy-1078354.jpeg?w=400",
                    stock: 180,
                    rating: 4.8,
                    benefits: ["Magnesium-rich", "Natural energy boost", "Creamy texture"],
                    isActive: true,
                },
                {
                    name: "Iranian Premium Pistachios",
                    slug: "iranian-pistachios",
                    tagline: "Vivid green, naturally cracked",
                    description: "Sourced from the Kerman highlands of Iran, these pistachios are renowned for their jewel-green kernels and complex sweetness.",
                    price: 28.99,
                    category: "Pistachios",
                    image: "https://images.pexels.com/photos/6654312/pistachios-nuts-snack-food-6654312.jpeg?w=400",
                    stock: 150,
                    rating: 4.9,
                    benefits: ["Antioxidant-dense", "Plant protein", "Naturally sweet"],
                    isActive: true,
                },
                {
                    name: "Medjool Dates - Jumbo Grade",
                    slug: "medjool-dates",
                    tagline: "Caramel-soft, naturally sweet",
                    description: "Jumbo Medjool dates with a fudgy, caramel-like center. The most luxurious natural sweetener you'll ever taste.",
                    price: 18.99,
                    category: "Dates",
                    image: "https://images.pexels.com/photos/55750/date-fruit-fruit-dates-fruit-natural-55750.jpeg?w=400",
                    stock: 300,
                    rating: 4.9,
                    benefits: ["Natural sweetener", "High in fiber", "Quick energy"],
                    isActive: true,
                },
                {
                    name: "Gourmet Energy Trail Mix",
                    slug: "gourmet-trail-mix",
                    tagline: "Berries, dark cacao, premium nuts",
                    description: "A balanced composition of roasted almonds, cashews, pumpkin seeds, tart cranberries, sun-dried blueberries, and 70% dark cacao chunks.",
                    price: 26.99,
                    category: "Trail Mixes",
                    image: "https://images.pexels.com/photos/1640777/nuts-mix-trail-mix-snack-1640777.jpeg?w=400",
                    stock: 120,
                    rating: 4.7,
                    benefits: ["Trail-ready energy", "Antioxidant-rich", "Balanced nutrition"],
                    isActive: true,
                },
                {
                    name: "Wildflower Honey Roasted Mix",
                    slug: "honey-roasted-nuts",
                    tagline: "Slow-glazed, naturally sweetened",
                    description: "Premium almonds, cashews, and pecans slow-glazed in raw wildflower honey, then finished with a whisper of sea salt.",
                    price: 25.99,
                    category: "Healthy Snacks",
                    image: "https://images.pexels.com/photos/5939/nuts-food-honey-snack.jpg?w=400",
                    stock: 90,
                    rating: 4.8,
                    benefits: ["Lightly sweetened", "Crunchy texture", "All natural"],
                    isActive: true,
                },
            ];
            await Product.insertMany(products);
            console.log(`✅ Created ${products.length} products`);
        }

        // ========== SEED TESTIMONIALS ==========
        const testimonialCount = await Testimonial.countDocuments();
        if (testimonialCount === 0) {
            const testimonials = [
                {
                    name: "Aanya R.",
                    location: "Mumbai, India",
                    content: "The pistachios are unreal — vivid green, perfectly cracked, a different league. Best dry fruits I've ever had!",
                    rating: 5,
                    order: 1,
                    isActive: true,
                },
                {
                    name: "Daniel K.",
                    location: "London, UK",
                    content: "Packaging feels like opening a luxury fragrance. The almonds are buttery and fresh. Will definitely order again.",
                    rating: 5,
                    order: 2,
                    isActive: true,
                },
                {
                    name: "Sara M.",
                    location: "Dubai, UAE",
                    content: "Our entire family switched. The Medjool dates are caramel — actual caramel. Simply outstanding quality.",
                    rating: 5,
                    order: 3,
                    isActive: true,
                },
                {
                    name: "Priya S.",
                    location: "Bengaluru, India",
                    content: "Best gifting brand I've found. Showed up beautifully boxed and devastatingly good. The trail mix is addictive!",
                    rating: 5,
                    order: 4,
                    isActive: true,
                },
            ];
            await Testimonial.insertMany(testimonials);
            console.log(`✅ Created ${testimonials.length} testimonials`);
        }

        console.log('\n🎉 ==================================');
        console.log('🎉 DATABASE SEEDING COMPLETED!');
        console.log('🎉 ==================================');
        console.log('\n📋 Summary:');
        if (!isProduction) {
            console.log(`   👤 Admin: ${adminEmail}`);
            console.log(`   🔑 Password: ${adminPassword}`);
            console.log('   ⚠️  CHANGE PASSWORD ON FIRST LOGIN');
        }
        console.log(`   📦 Products: ${await Product.countDocuments()} total`);
        console.log(`   🏷️  Categories: ${await Category.countDocuments()} total`);
        console.log(`   ⭐ Testimonials: ${await Testimonial.countDocuments()} total`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();