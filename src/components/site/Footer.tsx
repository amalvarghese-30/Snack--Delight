import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-background/60 px-6 pt-20 pb-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-2xl tracking-[0.2em] text-gradient-gold">Snacks Delight</div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Hand-curated dry fruits and gourmet snacks, sourced from the world's finest groves
            and packed within hours of harvest.
          </p>
          <div className="mt-6 flex gap-3 text-muted-foreground">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:border-gold hover:text-gold"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {[
          { title: "Shop", links: ["Almonds", "Cashews", "Pistachios", "Dates", "Trail Mixes"] },
          { title: "Support", links: ["Contact", "Shipping", "Returns", "FAQ", "Track Order"] },
          { title: "Brand", links: ["Our Story", "Sustainability", "Gifting", "Wholesale", "Press"] },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-xs uppercase tracking-[0.32em] text-gold">{col.title}</div>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}>
                  <Link to="/shop" className="transition hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
        <div>© {new Date().getFullYear()} Snacks Delight Gourmet. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
