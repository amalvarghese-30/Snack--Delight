import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { api } from "@/services/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await api.subscribeToNewsletter(email);
      setStatus("success");
      setMessage("Subscribed successfully!");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section className="relative px-6 py-32">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] glass-card p-10 md:p-16 text-center">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-50 blur-3xl"
          style={{ background: "var(--gold)" }}
        />
        <div className="reveal mb-3 text-xs uppercase tracking-[0.4em] text-gold">
          Stay in the know
        </div>
        <h2 className="reveal font-display text-4xl md:text-6xl leading-[1.02] text-balance">
          Exclusive offers &
          <span className="block italic text-gradient-gold">healthy snack updates.</span>
        </h2>
        <p className="reveal mx-auto mt-5 max-w-md text-muted-foreground">
          Join 40,000+ taste-led readers. New harvests, recipes and members-only drops.
        </p>

        <form
          onSubmit={handleSubmit}
          className="reveal mx-auto mt-10 flex max-w-md items-center gap-2 rounded-full glass p-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-transparent px-5 py-3 text-sm outline-none placeholder:text-muted-foreground"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="group inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground transition hover:scale-[1.03] disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Subscribe"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${status === "success" ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}