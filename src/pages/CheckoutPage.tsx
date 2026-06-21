import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { useCartStore } from '@/stores/cartStore';
import { api } from '@/services/api';

export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        paymentMethod: 'cod',
    });

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderData = {
                items: items.map(item => ({
                    product: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                })),
                shippingAddress: {
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: 'US',
                },
                paymentMethod: formData.paymentMethod,
                totalAmount: getTotalPrice(),
            };

            await api.createOrder(orderData);
            clearCart();
            alert('Order placed successfully!');
            navigate('/shop');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="px-6 pt-36 pb-24">
                <div className="mx-auto max-w-4xl">
                    <h1 className="font-display text-5xl mb-8">Checkout</h1>
                    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
                        <div className="space-y-4">
                            <h2 className="font-display text-xl">Shipping Information</h2>
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-3"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-3"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Address"
                                required
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-3"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="City"
                                required
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-3"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="State"
                                required
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-3"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Zip Code"
                                required
                                className="w-full rounded-lg border border-border bg-transparent px-4 py-3"
                                value={formData.zipCode}
                                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <h2 className="font-display text-xl">Payment Method</h2>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    />
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>

                            <div className="glass-card rounded-xl p-4 mt-6">
                                <div className="flex justify-between mb-2">
                                    <span>Subtotal</span>
                                    <span>${getTotalPrice()}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between font-display text-xl mt-4 pt-4 border-t border-border">
                                    <span>Total</span>
                                    <span className="text-gold">${getTotalPrice()}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gold text-primary-foreground py-3 rounded-full font-medium hover:scale-[1.02] transition"
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}