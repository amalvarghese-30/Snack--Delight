import heroImg from "@/assets/hero-nuts.jpg";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function Hero() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const on = () => setY(window.scrollY);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.12 80 / 0.18), transparent 60%)",
        }}
      />
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="reveal mb-7 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            New Harvest · 2026
          </div>

          {/* Updated responsive hero text */}
          <h1 className="reveal font-display text-responsive-hero leading-[0.98] text-balance">
            Premium dry fruits,
            <span className="block italic text-gradient-gold">crafted for living well.</span>
          </h1>

          <p className="reveal mt-7 max-w-lg text-base md:text-lg leading-relaxed text-muted-foreground">
            Single-origin nuts and gourmet snacks, sourced at peak season and
            sealed within hours of harvest. Pure indulgence — without compromise.
          </p>

          {/* Updated buttons with responsive padding and justify-center on mobile */}
          <div className="reveal mt-10 flex flex-wrap items-center justify-center sm:justify-start gap-3 md:gap-4">
            <a
              href="/shop"
              className="group inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-gold px-5 py-3 md:px-7 md:py-4 text-xs md:text-sm font-medium uppercase tracking-[0.22em] text-primary-foreground transition hover:scale-[1.02] hover:shadow-[0_20px_60px_-10px_var(--gold)]"
            >
              Shop Collection
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 md:px-7 md:py-4 text-xs md:text-sm uppercase tracking-[0.22em] text-foreground/90 transition hover:border-gold hover:text-gold"
            >
              Explore Products
            </a>
          </div>

          <div className="reveal mt-14 grid max-w-md grid-cols-3 gap-4 md:gap-6">
            {[
              { v: "120+", l: "Sourcing partners" },
              { v: "48h", l: "Farm to seal" },
              { v: "4.9★", l: "From 12k reviews" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl md:text-3xl text-gradient-gold">{s.v}</div>
                <div className="mt-1 text-[9px] md:text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-luxe"
            style={{ transform: `translateY(${y * -0.06}px)` }}
          >
            <img
              src={heroImg}
              alt="Premium dry fruits"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent" />
          </div>

          {/* Floating glass cards */}
          <div
            className="absolute -left-6 top-12 hidden w-56 rounded-2xl glass-card p-4 md:block float-slow"
            style={{ transform: `translateY(${y * -0.12}px)` }}
          >
            <div className="text-[10px] uppercase tracking-[0.28em] text-gold">Today's pick</div>
            <div className="mt-2 font-display text-lg leading-tight">Iranian Pistachios</div>
            <div className="mt-1 text-xs text-muted-foreground">Vivid green · jewel-grade</div>
          </div>

          <div
            className="absolute -bottom-6 right-2 hidden w-60 rounded-2xl glass-card p-4 md:block float-slower"
            style={{ transform: `translateY(${y * 0.08}px)` }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gold text-primary-foreground font-display text-lg">
                ✦
              </div>
              <div>
                <div className="text-sm font-medium">Vacuum fresh</div>
                <div className="text-xs text-muted-foreground">Sealed within 48h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}