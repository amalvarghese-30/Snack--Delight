// src/components/site/Testimonials.tsx (FULLY UPDATED)
import { useState, useEffect } from 'react';
import { Quote, Star, ImageIcon } from "lucide-react";
import { api } from '@/services/api';
import { getImageUrl } from '@/lib/utils';

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  content: string;
  rating: number;
  image?: string;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await api.getPublicTestimonials();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto"></div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  // Duplicate for infinite marquee effect
  const loop = [...testimonials, ...testimonials];

  return (
    <section className="relative overflow-hidden py-32">
      <div className="reveal mb-16 px-6 text-center">
        <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Loved By Many</div>
        <h2 className="font-display text-5xl md:text-6xl text-balance">
          Words from the <span className="italic text-gradient-gold">Snacks Delight circle.</span>
        </h2>
      </div>

      <div
        className="relative"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="marquee">
          {loop.map((r, i) => (
            <article
              key={`${r._id}-${i}`}
              className="w-[420px] shrink-0 rounded-3xl glass-card p-8"
            >
              <Quote className="h-6 w-6 text-gold" />
              <p className="mt-5 font-display text-xl leading-snug text-balance">"{r.content}"</p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <div className="flex items-center gap-3">
                  {r.image ? (
                    <img
                      src={getImageUrl(r.image)}
                      alt={r.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.location}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}