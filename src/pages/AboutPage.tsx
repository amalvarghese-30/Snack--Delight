import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { AboutBrand } from "@/components/site/AboutBrand";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { useReveal } from "@/hooks/use-reveal";

export default function AboutPage() {
    useReveal();
    return (
        <>
            <Navbar />
            <main className="pt-32">
                <section className="px-6 pt-12 pb-8">
                    <div className="reveal mx-auto max-w-5xl text-center">
                        <div className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Our Story</div>
                        <h1 className="font-display text-6xl md:text-8xl leading-[0.98] text-balance">
                            A decade of <span className="italic text-gradient-gold">slow craft.</span>
                        </h1>
                        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">
                            From a small grove in California to groves around the world — Snacks Delight was built
                            on the simple belief that food made with care tastes like it.
                        </p>
                    </div>
                </section>
                <AboutBrand />
                <WhyChooseUs />
            </main>
            <Footer />
        </>
    );
}