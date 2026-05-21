const highlights = [
    {
        title: 'Wallet funding',
        body: 'Fast Paystack checkout with transaction tracking and verification.',
    },
    {
        title: 'Airtime and data',
        body: 'Direct service purchases from the dashboard using wallet balance.',
    },
    {
        title: 'Admin-ready workflows',
        body: 'Separate admin access, support threads, and tracked service request operations.',
    },
];

export default function About() {
    return (
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr,0.94fr]">
                <div className="surface-panel-light rounded-[2rem] p-8 text-slate-900 sm:p-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">
                        About SM PAY
                    </p>
                    <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                        A simpler way to fund wallets, pay bills, and stay connected.
                    </h2>
                    <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                        SM PAY is a practical fintech dashboard built around everyday digital payment habits. The focus is clarity first: secure access, quick wallet funding, VTU services, support visibility, and transaction tracking that feels easy to follow.
                    </p>
                    <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                        The product surface now aims to match the capability underneath it. That means stronger visual trust, cleaner service routing, and a more responsive experience across public, user, and admin screens.
                    </p>
                </div>

                <div className="surface-panel-dark rounded-[2rem] p-8 text-white sm:p-10">
                    <h3 className="text-2xl font-semibold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                        What we are building
                    </h3>
                    <div className="mt-8 grid gap-4">
                        {highlights.map((item, index) => (
                            <div
                                key={item.title}
                                className="surface-panel-soft reveal-up rounded-[1.5rem] p-5"
                                style={{ animationDelay: `${index * 90 + 80}ms` }}
                            >
                                <p className="font-semibold text-white">{item.title}</p>
                                <p className="mt-3 text-sm leading-7 text-[#b7c6d7]">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
