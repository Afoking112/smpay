import Navbar from "@/component/Navbar";
import About from "@/component/About";
import CTA from "@/component/CTA";
import Footer from "@/component/Footer";

export default function AboutPage() {
    return (
        <main className="public-aurora public-grid min-h-screen text-white">
            <Navbar />

            <section className="px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pt-24">
                <div className="surface-panel-hero mx-auto max-w-7xl rounded-[2.5rem] px-6 py-16 sm:px-10 lg:px-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
                        Our Story
                    </p>
                    <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
                        Building a practical fintech product around real everyday payment habits.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-[#cde8f4]">
                        SM PAY is designed to make common digital payment tasks feel simpler, faster, and easier to trust. The focus is not noise. The focus is usable wallet funding, VTU services, and clear transaction visibility.
                    </p>
                </div>
            </section>

            <About />

            <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
                    <div className="surface-panel-light rounded-[2rem] p-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Mission</p>
                        <p className="mt-4 leading-7 text-slate-600">
                            Deliver a cleaner payment experience for users who just want airtime, data, wallet funding, and dependable transaction records without friction.
                        </p>
                    </div>
                    <div className="surface-panel-light rounded-[2rem] p-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Current Focus</p>
                        <p className="mt-4 leading-7 text-slate-600">
                            Finish the core payment loop, strengthen backend visibility, and improve the product surface before expanding into more verticals.
                        </p>
                    </div>
                    <div className="surface-panel-light rounded-[2rem] p-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">What Comes Next</p>
                        <p className="mt-4 leading-7 text-slate-600">
                            Better service catalogs, stronger admin workflows, more utility payments, and clearer customer support touchpoints across the app.
                        </p>
                    </div>
                </div>
            </section>

            <CTA />
            <Footer />
        </main>
    );
}
