export default function About() {
    return (
        <section className="bg-white py-20 px-6 md:px-10">
            <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-start">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                        About SM Pay
                    </p>
                    <h2 className="mt-4 text-4xl font-bold text-gray-900">
                        A simpler way to fund wallets, pay bills, and stay connected.
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        SM Pay is a lightweight fintech dashboard built to make everyday digital payments feel fast and predictable. From airtime and data to wallet funding and transaction history, the goal is to give users one clear place to manage common payment needs.
                    </p>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                        The current product is focused on practical essentials first: secure authentication, Paystack wallet funding, VTU-powered purchases, and simple transaction visibility. It is designed to be a solid foundation that can grow into a fuller digital services platform.
                    </p>
                </div>

                <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-8 text-white shadow-2xl">
                    <h3 className="text-2xl font-semibold">What we are building</h3>
                    <div className="mt-6 grid gap-4">
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                            <p className="font-medium">Wallet funding</p>
                            <p className="mt-2 text-sm text-blue-50">
                                Fast Paystack checkout with transaction tracking and verification.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                            <p className="font-medium">Airtime and data</p>
                            <p className="mt-2 text-sm text-blue-50">
                                Direct service purchases from the user dashboard and wallet balance.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                            <p className="font-medium">Admin-ready foundation</p>
                            <p className="mt-2 text-sm text-blue-50">
                                Separate admin authentication paths for future operational controls.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
