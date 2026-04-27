import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="bg-blue-600 text-white py-24 px-10">

            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

                <div>
                    <h1 className="text-4xl font-bold mb-6">
                        Pay All Your Bills Easily
                    </h1>

                    <p className="mb-6 text-lg">
                        Stay connected anywhere, anytime. Pay electricity,
                        cable TV, data and airtime instantly.
                    </p>

                    <div className="flex gap-4">
                        <Link href="/signup">
                            <button className="bg-white text-blue-600 px-6 py-3 rounded cursor-pointer">
                                Get Started
                            </button>
                        </Link>

                        <Link href="/about">
                            <button className="border border-white text-white px-6 py-3 rounded cursor-pointer hover:bg-white/10 transition">
                                Learn More
                            </button>
                        </Link>
                    </div>
                </div>

                <Image
                    src="https://www.otapay.ng/wp-content/uploads/2024/12/phone-hand.webp"
                    width={640}
                    height={640}
                    className="w-full"
                    alt="app preview"
                />

            </div>

        </section>
    )
}
