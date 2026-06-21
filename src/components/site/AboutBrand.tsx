import aboutImg from "@/assets/about-craft.jpg";

export function AboutBrand() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div className="reveal relative">
          <div className="relative overflow-hidden rounded-[2rem] shadow-luxe">
            <img src={aboutImg} alt="Artisan craftsmanship" loading="lazy" className="h-[640px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden w-64 rounded-2xl glass-card p-5 md:block">
            <div className="font-display text-4xl text-gradient-gold">Est. 2014</div>
            <div className="mt-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              A decade of slow-craft sourcing
            </div>
          </div>
        </div>

        <div>
          <div className="reveal mb-4 text-xs uppercase tracking-[0.4em] text-gold">Our Story</div>
          <h2 className="reveal font-display text-5xl md:text-6xl leading-[1.02] text-balance">
            Sourced with intention.
            <span className="block italic text-gradient-gold">Crafted with care.</span>
          </h2>
          <p className="reveal mt-8 text-lg leading-relaxed text-muted-foreground">
            Every kernel begins with a relationship — a grower we know, a grove we visit,
            a season we wait for. We taste hundreds of batches so you receive only the few
            that earn our seal.
          </p>
          <p className="reveal mt-4 leading-relaxed text-muted-foreground">
            From single-origin California almonds to jewel-bright Kerman pistachios,
            our collection celebrates terroir, freshness and the quiet luxury of food
            made the right way.
          </p>

          <div className="reveal mt-10 grid grid-cols-2 gap-8 border-t border-border pt-8">
            {[
              { t: "Single-origin", d: "Traceable to grove" },
              { t: "Slow roasted", d: "Small-batch craft" },
              { t: "Vacuum sealed", d: "Locks in freshness" },
              { t: "Naturally pure", d: "No additives, ever" },
            ].map((b) => (
              <div key={b.t}>
                <div className="font-display text-xl">{b.t}</div>
                <div className="text-sm text-muted-foreground">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
