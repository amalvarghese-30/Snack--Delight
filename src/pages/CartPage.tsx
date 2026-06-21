import { Link } from 'react-router-dom';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { useCartStore } from '@/stores/cartStore';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();

    if (items.length === 0) {
        return (
            <>
                <Navbar />
                <main className="px-6 pt-36 pb-24 min-h-screen">
                    <div className="mx-auto max-w-7xl text-center">
                        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h1 className="font-display text-3xl mb-2">Your cart is empty</h1>
                        <p className="text-muted-foreground mb-6">Looks like you haven't added any items yet.</p>
                        <Link to="/shop" className="inline-flex bg-gold text-primary-foreground px-6 py-3 rounded-full">
                            Continue Shopping
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="px-6 pt-36 pb-24">
                <div className="mx-auto max-w-7xl">
                    <h1 className="font-display text-5xl mb-8">Shopping Cart</h1>
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div key={item.productId} className="glass-card rounded-xl p-4 flex gap-4">
                                    <img src={item.image} alt={item.name} className="w-24 h-24 rounded object-cover" />
                                    <div className="flex-1">
                                        <h3 className="font-display text-lg">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">{item.category}</p>
                                        <p className="text-gold font-medium mt-1">${item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="p-1 rounded-full hover:bg-secondary"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="p-1 rounded-full hover:bg-secondary"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.productId)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card rounded-xl p-6 h-fit">
                            <h2 className="font-display text-xl mb-4">Order Summary</h2>
                            <div className="space-y-2 border-b border-border pb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal ({getTotalItems()} items)</span>
                                    <span>${getTotalPrice()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 font-display text-xl">
                                <span>Total</span>
                                <span className="text-gold">${getTotalPrice()}</span>
                            </div>
                            <Link
                                to="/checkout"
                                className="block text-center bg-gold text-primary-foreground py-3 rounded-full mt-6 hover:scale-[1.02] transition"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}