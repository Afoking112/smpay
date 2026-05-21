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
        <main className="public-aurora public-grid min-h-screen text-white">
            <Navbar />

            <section className="px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-24">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7df2c8]">
                        Contact
                    </p>
                    <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.9fr]">
                        <div>
                            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                                Let&apos;s talk about support, payments, or what should come next.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b7c6d7]">
                                SM PAY is still actively growing, so feedback matters. If you are testing the product, running into payment issues, or planning a partnership, this is the best place to start the conversation.
                            </p>

                            <div className="mt-10 grid gap-5 md:grid-cols-3">
                                {contactCards.map((card) => (
                                    <div key={card.title} className="surface-panel-light rounded-[2rem] p-6">
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                                            {card.title}
                                        </p>
                                        <p className="mt-4 font-semibold text-slate-900">{card.detail}</p>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="surface-panel-hero rounded-[2rem] p-8 text-white">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                Quick Reach
                            </p>
                            <h2 className="mt-4 text-3xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                                Need a direct path?
                            </h2>
                            <p className="mt-4 leading-7 text-[#cde8f4]">
                                The fastest way to get help right now is by email. Include your payment reference, affected account email, and what happened so the issue can be traced faster.
                            </p>

                            <div className="mt-8 space-y-4">
                                <a
                                    href="mailto:help@smpay.app?subject=SM%20Pay%20Support"
                                    className="button-ghost block px-5 py-4 text-center font-semibold"
                                >
                                    Email Support
                                </a>
                                <a
                                    href="mailto:partnerships@smpay.app?subject=SM%20Pay%20Partnership"
                                    className="button-secondary block px-5 py-4 text-center font-semibold"
                                >
                                    Talk Partnerships
                                </a>
                            </div>

                            <div className="surface-panel-soft mt-8 rounded-2xl p-5">
                                <p className="text-sm font-semibold">Helpful when reporting an issue</p>
                                <p className="mt-3 text-sm leading-6 text-[#cde8f4]">
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
