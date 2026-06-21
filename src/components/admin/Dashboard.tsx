// src/components/admin/Dashboard.tsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Users, Package, DollarSign, ShoppingBag } from 'lucide-react';
import { productService } from '@/services/productService';

interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalUsers: number;
    recentOrders: any[];
}

export function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,  // Changed from 6 to 0
        totalUsers: 0,
        recentOrders: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Check if we're in browser environment
            if (typeof window === 'undefined') return;

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to continue');
                setLoading(false);
                return;
            }

            // Fetch products count
            const productsData = await productService.getAllProducts();
            const productsCount = Array.isArray(productsData) ? productsData.length :
                (productsData.products ? productsData.products.length : 0);

            const [orders, users] = await Promise.all([
                api.getAllOrders().catch(() => []),
                api.getAllUsers().catch(() => []),
            ]);

            const totalRevenue = Array.isArray(orders)
                ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                : 0;

            setStats({
                totalOrders: Array.isArray(orders) ? orders.length : 0,
                totalRevenue,
                totalProducts: productsCount,  // Now fetches actual count
                totalUsers: Array.isArray(users) ? users.length : 0,
                recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
            });
        } catch (error: any) {
            console.error('Failed to fetch dashboard data:', error);
            setError(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Rest of the component remains the same...
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gold text-primary-foreground px-4 py-2 rounded-full"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
        { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500' },
        { title: 'Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
        { title: 'Users', value: stats.totalUsers, icon: Users, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-3xl text-gradient-gold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.title} className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <p className="text-2xl font-display mt-1">{stat.value}</p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-full`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card rounded-xl p-6">
                <h2 className="font-display text-xl mb-4">Recent Orders</h2>
                {stats.recentOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4">Order ID</th>
                                    <th className="text-left py-3 px-4">Date</th>
                                    <th className="text-left py-3 px-4">Amount</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-border/50">
                                        <td className="py-3 px-4">#{order._id?.slice(-6) || 'N/A'}</td>
                                        <td className="py-3 px-4">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        <td className="py-3 px-4">${order.totalAmount?.toFixed(2) || 0}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${order.orderStatus === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                                order.orderStatus === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                    'bg-yellow-500/20 text-yellow-500'
                                                }`}>
                                                {order.orderStatus || 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}