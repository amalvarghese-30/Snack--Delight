import { useEffect, useState } from "react";

export function Loader() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 3200);
    return () => clearTimeout(t);
  }, []);
  if (hidden) return null;
  return (
    <div className="fixed inset-0 z-[100] grain loader-veil bg-background">
      <div className="absolute inset-0 flex flex-col items-center justify-center loader-fade">
        <div className="font-display text-5xl tracking-[0.18em] text-gradient-gold">
          Snacks Delight
        </div>
        <div className="mt-6 h-[1px] w-44 overflow-hidden bg-border">
          <div
            className="h-full bg-[linear-gradient(90deg,transparent,var(--gold),transparent)] bg-[length:200%_100%]"
            style={{ animation: "shimmer 1.4s linear infinite" }}
          />
        </div>
        <div className="mt-4 text-xs uppercase tracking-[0.4em] text-muted-foreground">
          Crafted by Nature
        </div>
      </div>
    </div>
  );
}
