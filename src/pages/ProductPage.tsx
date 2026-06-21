import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Heart, Minus, Plus, ShieldCheck, Star, Truck } from 'lucide-react'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { ProductCard } from '@/components/site/ProductCard'
import { useReveal } from '@/hooks/use-reveal'
import { useCartStore } from '@/stores/cartStore'
import { api } from '@/services/api'

interface Product {
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

export default function ProductPage() {
    useReveal()
    const { slug } = useParams<{ slug: string }>()
    const [product, setProduct] = useState<Product | null>(null)
    const [related, setRelated] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [qty, setQty] = useState(1)
    const addToCart = useCartStore((state) => state.addItem)

    useEffect(() => {
        if (slug) {
            fetchProduct()
        } else {
            setError('No product specified')
            setLoading(false)
        }
    }, [slug])

    const fetchProduct = async () => {
        setLoading(true)
        setError('')

        try {
            console.log('Fetching product with slug:', slug)

            // Method 1: Using API service
            const data = await api.getProductBySlug(slug!)
            console.log('Product data:', data)
            setProduct(data)

            // Fetch related products from same category
            if (data && data.category) {
                const relatedProducts = await api.getAllProducts({ category: data.category })
                setRelated(relatedProducts.filter((p: any) => p.slug !== slug).slice(0, 3))
            }
        } catch (err: any) {
            console.error('Error fetching product:', err)
            setError(err.message || 'Product not found')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = () => {
        if (!product) return

        addToCart({
            productId: product._id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            quantity: qty,
            image: product.image,
            category: product.category,
        })
        alert('Added to cart!')
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
                <Footer />
            </>
        )
    }

    if (error || !product) {
        return (
            <>
                <Navbar />
                <div className="grid min-h-[60vh] place-items-center px-6">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">!</div>
                        <p className="text-red-500 mb-4 text-lg">{error || 'Product not found'}</p>
                        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
                        <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]">
                            ← Back to shop
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        )
    }

    // Transform for ProductCard
    const relatedForCard = related.map(p => ({
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

    return (
        <>
            <Navbar />
            <main className="px-6 pt-36 pb-24">
                <div className="mx-auto max-w-7xl">
                    <Link to="/shop" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-muted-foreground hover:text-gold transition">
                        ← Back to shop
                    </Link>

                    <div className="mt-8 grid items-start gap-12 lg:grid-cols-2">
                        {/* Product Image */}
                        <div className="reveal">
                            <div className="overflow-hidden rounded-[2rem] shadow-luxe">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="aspect-[4/5] w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x600?text=No+Image'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="reveal">
                            <div className="text-xs uppercase tracking-[0.4em] text-gold">{product.category}</div>
                            <h1 className="mt-4 font-display text-5xl md:text-6xl leading-[1.02] text-balance">{product.name}</h1>
                            <p className="mt-3 text-lg text-muted-foreground">{product.tagline || 'Premium quality dry fruits'}</p>

                            <div className="mt-5 flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-gold">
                                    <Star className="h-4 w-4 fill-current" />
                                    {product.rating || 4.8}
                                </div>
                                <div className="text-muted-foreground">Premium quality</div>
                            </div>

                            <div className="mt-8 font-display text-5xl text-gradient-gold">${product.price}</div>

                            <p className="mt-6 max-w-prose leading-relaxed text-muted-foreground">{product.description}</p>

                            {product.benefits && product.benefits.length > 0 && (
                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    {product.benefits.map((b: string, idx: number) => (
                                        <div key={idx} className="rounded-2xl glass-card p-4 text-sm">
                                            {b}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Stock Status */}
                            <div className="mt-6">
                                {product.stock > 0 ? (
                                    <p className="text-sm text-green-500">✓ In Stock ({product.stock} available)</p>
                                ) : (
                                    <p className="text-sm text-red-500">✗ Out of Stock</p>
                                )}
                            </div>

                            <div className="mt-10 flex flex-wrap items-center gap-4">
                                <div className="flex items-center rounded-full border border-border">
                                    <button
                                        className="grid h-12 w-12 place-items-center rounded-full hover:bg-secondary transition"
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        disabled={product.stock === 0}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <div className="w-10 text-center font-medium">{qty}</div>
                                    <button
                                        className="grid h-12 w-12 place-items-center rounded-full hover:bg-secondary transition"
                                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                                        disabled={product.stock === 0}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-medium uppercase tracking-[0.22em] text-primary-foreground transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {product.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                                </button>
                            </div>

                            {/* Shipping Info */}
                            <div className="mt-10 grid gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <Truck className="mt-0.5 h-4 w-4 text-gold" />
                                    <div>
                                        <div className="text-foreground">Free express shipping</div>
                                        Delivered in 1–3 days, temperature controlled.
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 text-gold" />
                                    <div>
                                        <div className="text-foreground">Freshness guarantee</div>
                                        100% refund if not perfectly fresh on arrival.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedForCard.length > 0 && (
                        <div className="reveal mt-32">
                            <div className="mb-10 flex items-end justify-between">
                                <h2 className="font-display text-4xl md:text-5xl">You may also love</h2>
                                <Link to="/shop" className="text-xs uppercase tracking-[0.32em] text-gold hover:underline">
                                    View all →
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {relatedForCard.map((p, i) => (
                                    <div key={p._id} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    )
}