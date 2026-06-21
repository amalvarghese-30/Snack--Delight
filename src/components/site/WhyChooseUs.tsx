import { Award, Globe2, Sparkles, Lock } from "lucide-react";

const items = [
  { icon: Award, t: "Export Quality", d: "Every batch graded against international standards." },
  { icon: Sparkles, t: "Vacuum Fresh", d: "Sealed at peak freshness in nitrogen-flushed pouches." },
  { icon: Globe2, t: "Nationwide Express", d: "Temperature-controlled delivery in 1–3 days." },
  { icon: Lock, t: "Secure Checkout", d: "PCI-DSS payments, end-to-end encrypted." },
];

export function WhyChooseUs() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal mb-14 text-center">
          <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Why Snacks Delight</div>
          <h2 className="font-display text-5xl md:text-6xl text-balance">
            Quality you can <span className="italic text-gradient-gold">taste.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div
              key={it.t}
              className="reveal group relative overflow-hidden rounded-3xl glass-card p-7 hover-lift"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 text-gold transition group-hover:bg-gold group-hover:text-primary-foreground">
                <it.icon className="h-6 w-6" />
              </div>
              <div className="font-display text-2xl">{it.t}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{it.d}</p>
              <div
                className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-60"
                style={{ background: "var(--gold)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
