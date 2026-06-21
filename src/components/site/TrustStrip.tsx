import { Leaf, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const items = [
  { icon: PackageCheck, title: "Freshly Packed", sub: "Within 48 hours" },
  { icon: Leaf, title: "100% Natural", sub: "Zero preservatives" },
  { icon: Truck, title: "Fast Delivery", sub: "Nationwide express" },
  { icon: ShieldCheck, title: "Secure Payments", sub: "256-bit encryption" },
];

export function TrustStrip() {
  return (
    <section className="relative px-6">
      <div className="mx-auto max-w-7xl rounded-3xl glass-card px-6 py-8 md:px-10">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="reveal flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/30 text-gold transition group-hover:bg-gold/10">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium tracking-wide">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
