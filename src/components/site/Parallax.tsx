import { useEffect, useRef, useState } from "react";
import jar from "@/assets/parallax-jar.jpg";

export function Parallax() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const v = 1 - (r.top + r.height / 2) / (vh + r.height / 2);
      setP(Math.max(-0.5, Math.min(0.5, v - 0.5)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <section ref={ref} className="relative my-32 overflow-hidden">
      <div className="relative mx-auto h-[80vh] max-h-[800px] w-full">
        <img
          src={jar}
          alt="Floating jar"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: `translateY(${p * 80}px) scale(1.1)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/30 to-background" />
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
          <div className="reveal mb-6 text-xs uppercase tracking-[0.4em] text-gold">
            The Snacks Delight ritual
          </div>
          <h2
            className="font-display text-[clamp(3rem,9vw,8rem)] leading-[0.92] text-balance"
            style={{ transform: `translateY(${p * -40}px)` }}
          >
            A handful
            <span className="block italic text-gradient-gold">of everyday luxury.</span>
          </h2>
          <p className="reveal mt-8 max-w-xl text-lg text-muted-foreground">
            Slow down. Pour, savor, repeat. The smallest moments deserve the finest things.
          </p>
        </div>
      </div>
    </section>
  );
}
