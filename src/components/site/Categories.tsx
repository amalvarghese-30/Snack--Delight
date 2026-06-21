// src/components/site/Categories.tsx
import { Link } from "react-router-dom";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from '@/services/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  order: number;
  isActive: boolean;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getPublicCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
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

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Collections</div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1] text-balance">
              Explore the
              <span className="italic text-gradient-gold"> Snacks Delight house.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm md:text-base text-muted-foreground">
            {categories.length} curated families, each sourced from a single region and a single season.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => (
            <Link
              key={category._id}
              to={`/shop?category=${category.name}`}
              className="reveal group relative block aspect-[4/5] overflow-hidden rounded-[1.5rem]"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent transition-opacity duration-700 ${category.image ? 'group-hover:opacity-90' : ''}`} />

              {!category.image && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/30 to-secondary/10">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 md:p-7">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-0 transition group-hover:opacity-100">
                    Shop now
                  </div>
                  <h3 className="font-display text-xl md:text-3xl leading-tight transition-transform duration-700 group-hover:-translate-y-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-[200px]">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full glass text-gold transition group-hover:bg-gold group-hover:text-primary-foreground">
                  <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}