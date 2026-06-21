// src/hooks/use-reveal.ts
import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>(".reveal");
      console.log(`Found ${els.length} reveal elements`); // Debug log

      if (!els.length) return;

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );

      els.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);
}