import Navbar from "@/component/Navbar";
import About from "@/component/About";
import CTA from "@/component/CTA";
import Footer from "@/component/Footer";

export default function AboutPage() {
    return (
        <main className="bg-slate-50">
            <Navbar />

            <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-700 px-6 py-24 text-white md:px-10">
                <div className="mx-auto max-w-6xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
                        Our Story
                    </p>
                    <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                        Building a practical fintech product around real everyday payment habits.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-blue-50">
                        SM Pay is designed to make common digital payment tasks feel simpler, faster, and easier to trust. The focus is not noise. The focus is usable wallet funding, VTU services, and clear transaction visibility.
                    </p>
                </div>
            </section>

            <About />

            <section className="px-6 py-20 md:px-10">
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                    <div className="rounded-3xl bg-white p-8 shadow">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Mission</p>
                        <p className="mt-4 text-gray-600 leading-7">
                            Deliver a cleaner payment experience for users who just want airtime, data, wallet funding, and dependable transaction records without friction.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-white p-8 shadow">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Current Focus</p>
                        <p className="mt-4 text-gray-600 leading-7">
                            Finish the core payment loop, strengthen backend visibility, and improve the product surface before expanding into more verticals.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-white p-8 shadow">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">What Comes Next</p>
                        <p className="mt-4 text-gray-600 leading-7">
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
