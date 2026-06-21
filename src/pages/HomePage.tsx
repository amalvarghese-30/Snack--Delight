import { Loader } from '@/components/site/Loader'
import { Navbar } from '@/components/site/Navbar'
import { Footer } from '@/components/site/Footer'
import { Hero } from '@/components/site/Hero'
import { TrustStrip } from '@/components/site/TrustStrip'
import { Categories } from '@/components/site/Categories'
import { BestSellers } from '@/components/site/BestSellers'
import { AboutBrand } from '@/components/site/AboutBrand'
import { Parallax } from '@/components/site/Parallax'
import { WhyChooseUs } from '@/components/site/WhyChooseUs'
import { Testimonials } from '@/components/site/Testimonials'
import { Newsletter } from '@/components/site/Newsletter'
import { useReveal } from '@/hooks/use-reveal'

export default function HomePage() {
    useReveal()

    return (
        <>
            <Loader />
            <Navbar />
            <main>
                <Hero />
                <TrustStrip />
                <Categories />
                <BestSellers />
                <AboutBrand />
                <Parallax />
                <WhyChooseUs />
                <Testimonials />
                <Newsletter />
            </main>
            <Footer />
        </>
    )
}