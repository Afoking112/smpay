import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";

const contactCards = [
    {
        title: 'Support',
        detail: 'help@smpay.app',
        description: 'Use this for account questions, wallet issues, and payment follow-up.',
    },
    {
        title: 'Business',
        detail: 'partnerships@smpay.app',
        description: 'Reach out for integrations, vendor access, and partnership conversations.',
    },
    {
        title: 'Availability',
        detail: 'Mon - Sat, 8:00 AM to 6:00 PM',
        description: 'Core response window for product and support enquiries.',
    },
];

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <section className="px-6 py-24 md:px-10">
                <div className="mx-auto max-w-6xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                        Contact
                    </p>
                    <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
                                Let&apos;s talk about support, payments, or what should come next.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                                SM Pay is still actively growing, so feedback matters. If you are testing the product, running into payment issues, or planning a partnership, this is the best place to start the conversation.
                            </p>

                            <div className="mt-10 grid gap-5 md:grid-cols-3">
                                {contactCards.map((card) => (
                                    <div key={card.title} className="rounded-3xl bg-white p-6 shadow">
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                                            {card.title}
                                        </p>
                                        <p className="mt-4 font-semibold text-gray-900">{card.detail}</p>
                                        <p className="mt-3 text-sm leading-6 text-gray-600">{card.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-8 text-white shadow-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                Quick Reach
                            </p>
                            <h2 className="mt-4 text-3xl font-bold">
                                Need a direct path?
                            </h2>
                            <p className="mt-4 leading-7 text-blue-50">
                                The fastest way to get help right now is by email. Include your payment reference, affected account email, and what happened so the issue can be traced faster.
                            </p>

                            <div className="mt-8 space-y-4">
                                <a
                                    href="mailto:help@smpay.app?subject=SM%20Pay%20Support"
                                    className="block rounded-2xl bg-white px-5 py-4 font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    Email Support
                                </a>
                                <a
                                    href="mailto:partnerships@smpay.app?subject=SM%20Pay%20Partnership"
                                    className="block rounded-2xl border border-white/30 px-5 py-4 font-semibold text-white transition hover:bg-white/10"
                                >
                                    Talk Partnerships
                                </a>
                            </div>

                            <div className="mt-8 rounded-2xl bg-white/10 p-5 backdrop-blur">
                                <p className="text-sm font-semibold">Helpful when reporting an issue</p>
                                <p className="mt-3 text-sm leading-6 text-blue-50">
                                    Share the transaction reference, service used, date/time, and whether the wallet balance changed. That will make support much faster once live operations scale up.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
