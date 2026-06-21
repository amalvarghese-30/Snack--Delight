import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const createIndexes = async () => {
    try {
        // Product indexes
        await Product.collection.createIndex({ category: 1 });
        await Product.collection.createIndex({ price: 1 });
        await Product.collection.createIndex({ slug: 1 }, { unique: true });
        await Product.collection.createIndex({ createdAt: -1 });
        await Product.collection.createIndex({ isActive: 1 });

        // Order indexes
        await Order.collection.createIndex({ user: 1 });
        await Order.collection.createIndex({ createdAt: -1 });
        await Order.collection.createIndex({ orderStatus: 1 });

        // User indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ role: 1 });

        console.log('✅ Database indexes created successfully');
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
    }
};