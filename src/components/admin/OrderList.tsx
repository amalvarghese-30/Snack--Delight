import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export function OrderList() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await api.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await api.updateOrderStatus(orderId, status);
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (loading) {
        return <div className="text-center py-8">Loading orders...</div>;
    }

    return (
        <div>
            <h1 className="font-display text-3xl text-gradient-gold mb-6">Orders</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="glass-card rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Order #{order._id.slice(-8)}</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-display text-xl">${order.totalAmount}</p>
                                <select
                                    value={order.orderStatus}
                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                    className="mt-2 bg-transparent border border-gold rounded-lg px-3 py-1 text-sm"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4">
                            <p className="font-medium mb-2">Items:</p>
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>${item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        {order.shippingAddress && (
                            <div className="border-t border-border mt-4 pt-4">
                                <p className="font-medium mb-2">Shipping to:</p>
                                <p className="text-sm text-muted-foreground">
                                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}