// src/components/site/BestSellers.tsx
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { api } from "@/services/api";

interface Product {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  description: string;
  benefits: string[];
}

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fix: API now returns { products, pagination }
      const response = await api.getAllProducts();
      // Check if response has products array (pagination) or is direct array
      const productsData = (response as any).products || response;
      // Show top 6 products as best sellers
      const formatted = productsData.map((p: any) => ({
        _id: p._id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline || 'Premium quality',
        price: p.price,
        rating: p.rating || 4.8,
        reviews: p.reviews?.length || 0,
        image: p.image,
        category: p.category,
        description: p.description,
        benefits: p.benefits || [],
      }));
      setProducts(formatted.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-7xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto"></div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-16 text-center">
          <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Best Sellers</div>
          <h2 className="font-display text-5xl md:text-6xl text-balance">
            What our connoisseurs
            <span className="italic text-gradient-gold"> reach for.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <div
              key={p._id}
              className="reveal"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}