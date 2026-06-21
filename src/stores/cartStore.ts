import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    productId: string;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
}

interface CartStore {
    items: CartItem[];
    wishlist: string[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    toggleWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            wishlist: [],

            addItem: (item) => {
                const { items } = get();
                const existing = items.find((i) => i.productId === item.productId);

                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.productId === item.productId
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...items, item] });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.productId !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            toggleWishlist: (productId) => {
                const { wishlist } = get();
                if (wishlist.includes(productId)) {
                    set({ wishlist: wishlist.filter((id) => id !== productId) });
                } else {
                    set({ wishlist: [...wishlist, productId] });
                }
            },

            isInWishlist: (productId) => {
                return get().wishlist.includes(productId);
            },
        }),
        {
            name: 'snack-delight-storage',
        }
    )
);