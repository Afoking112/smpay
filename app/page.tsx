import Navbar from "@/component/Navbar"
import Hero from "@/component/Hero"
import Services from "@/component/Service"
import CTA from "@/component/CTA"
import Newsletter from "@/component/Newsletter"
import Footer from "@/component/Footer"

export default function Home() {
    return (
        <main>
            <Navbar />
            <Hero />
            <Services />
            <CTA />
            <Newsletter />
            <Footer />
        </main>
    )
}