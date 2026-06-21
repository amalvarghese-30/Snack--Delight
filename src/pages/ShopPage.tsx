// src/pages/ShopPage.tsx
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { ProductCard } from '@/components/site/ProductCard'
import { useReveal } from '@/hooks/use-reveal'
import { api } from '@/services/api'
import { Loader2 } from 'lucide-react'

interface ProductFromDB {
    _id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    rating: number;
    benefits: string[];
    isActive: boolean;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    isActive: boolean;
}

export default function ShopPage() {
    useReveal()
    const [searchParams] = useSearchParams();
    const categoryFromUrl = searchParams.get('category');

    const [cat, setCat] = useState<string>(categoryFromUrl || "All")
    const [maxPrice, setMaxPrice] = useState(40)
    const [q, setQ] = useState("")
    const [products, setProducts] = useState<ProductFromDB[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch categories from database
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await api.getPublicCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    // Fetch products from API
    useEffect(() => {
        fetchProducts()
    }, [cat, maxPrice, q])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setError(null)

            const params: {
                category?: string;
                search?: string;
                maxPrice?: number;
            } = {}

            if (cat !== "All") params.category = cat
            if (q) params.search = q
            if (maxPrice < 40) params.maxPrice = maxPrice

            const data = await api.getAllProducts(params)
            setProducts(data)
        } catch (err: any) {
            console.error('Failed to fetch products:', err)
            setError(err.message || 'Failed to load products. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    // Build categories list from database
    const cats = ["All", ...categories.map((c) => c.name)]

    // Transform DB products to match ProductCard expected format
    const displayProducts = products
        .filter(p => p.isActive !== false)
        .map(p => ({
            _id: p._id,
            slug: p.slug,
            name: p.name,
            tagline: p.tagline || 'Premium quality',
            price: p.price,
            rating: p.rating || 4.8,
            reviews: 0,
            image: p.image,
            category: p.category,
            description: p.description,
            benefits: p.benefits || [],
        }))

    // Loading state
    if (loading && products.length === 0) {
        return (
            <>
                <Navbar />
                <main className="px-6 pt-36 pb-24 min-h-screen">
                    <div className="mx-auto max-w-7xl">
                        <div className="reveal mb-12 max-w-3xl">
                            <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Shop</div>
                            <h1 className="font-display text-5xl md:text-7xl leading-[1] text-balance">
                                The full <span className="italic text-gradient-gold">collection.</span>
                            </h1>
                        </div>
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto mb-4" />
                                <p className="text-muted-foreground">Loading premium snacks...</p>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    // Error state
    if (error) {
        return (
            <>
                <Navbar />
                <main className="px-6 pt-36 pb-24 min-h-screen">
                    <div className="mx-auto max-w-7xl">
                        <div className="reveal mb-12 max-w-3xl">
                            <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Shop</div>
                            <h1 className="font-display text-5xl md:text-7xl leading-[1] text-balance">
                                The full <span className="italic text-gradient-gold">collection.</span>
                            </h1>
                        </div>
                        <div className="rounded-3xl glass-card p-12 text-center">
                            <div className="text-red-500 mb-4">
                                <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg font-medium mb-2">Oops! Something went wrong</p>
                                <p className="text-muted-foreground mb-6">{error}</p>
                            </div>
                            <button
                                onClick={() => fetchProducts()}
                                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.22em] text-primary-foreground transition hover:scale-[1.02]"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <main className="px-6 pt-36 pb-24">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal mb-12 max-w-3xl">
                        <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Shop</div>
                        <h1 className="font-display text-5xl md:text-7xl leading-[1] text-balance">
                            The full <span className="italic text-gradient-gold">collection.</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground">
                            Browse every harvest — filter by category, price or search by name.
                        </p>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
                        {/* Sidebar Filters */}
                        <aside className="reveal h-fit space-y-8 rounded-3xl glass-card p-6 lg:sticky lg:top-28">
                            <div>
                                <div className="mb-3 text-[11px] uppercase tracking-[0.32em] text-gold">Search</div>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Find a product…"
                                    className="w-full rounded-full border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
                                />
                            </div>

                            <div>
                                <div className="mb-3 text-[11px] uppercase tracking-[0.32em] text-gold">Category</div>
                                <div className="flex flex-col gap-1.5 text-sm">
                                    {cats.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCat(c)}
                                            className={`rounded-full px-4 py-2 text-left transition ${cat === c ? "bg-gold text-primary-foreground" : "hover:bg-secondary"
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.32em] text-gold">
                                    <span>Max price</span>
                                    <span className="text-foreground">${maxPrice}</span>
                                </div>
                                <input
                                    type="range"
                                    min={10}
                                    max={40}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-[var(--gold)]"
                                />
                            </div>
                        </aside>

                        {/* Products Grid */}
                        <div>
                            <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
                                <span>{displayProducts.length} products</span>
                                <span>Sorted by relevance</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {displayProducts.map((p, i) => (
                                    <div key={p._id} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </div>

                            {displayProducts.length === 0 && !loading && (
                                <div className="rounded-3xl glass-card p-16 text-center text-muted-foreground">
                                    <p className="text-lg mb-2">No products match your filters</p>
                                    <p className="text-sm">Try adjusting your search or category selection</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}