// src/components/site/ProductCard.tsx
import { Link } from 'react-router-dom'
import { Heart, Plus, Star, ImageOff } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useState } from 'react'

export function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem)
  const toggleWishlist = useCartStore((state) => state.toggleWishlist)
  const isInWishlist = useCartStore((state) => state.isInWishlist)
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product.slug))
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category,
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleWishlist(product.slug)
    setIsWishlisted(!isWishlisted)
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative block overflow-hidden rounded-3xl glass-card hover-lift"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary/20">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/30 to-secondary/10">
            <ImageOff className="h-12 w-12 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{product.category}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <button
          aria-label="Wishlist"
          onClick={handleWishlist}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full glass text-foreground/80 transition hover:text-gold z-10"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-gold text-gold" : ""}`} />
        </button>
        <div className="absolute left-4 top-4 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gold z-10">
          {product.category}
        </div>
      </div>

      <div className="space-y-3 p-6">
        <div className="flex items-center gap-1 text-[12px] text-gold">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span className="font-medium">{product.rating || 4.8}</span>
          <span className="text-muted-foreground">· {product.reviews || 0} reviews</span>
        </div>
        <h3 className="font-display text-2xl leading-tight text-balance line-clamp-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.tagline || 'Premium quality'}</p>
        <div className="flex items-center justify-between pt-2">
          <div className="font-display text-2xl text-gradient-gold">${product.price}</div>
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="grid h-11 w-11 place-items-center rounded-full bg-gold text-primary-foreground transition hover:scale-110"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}