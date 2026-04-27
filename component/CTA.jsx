import Link from 'next/link';

export default function CTA() {
    return (
        <section className="bg-blue-600 text-white text-center py-20">

            <h2 className="text-3xl font-bold mb-6">
                Let&apos;s Help You Pay Those Bills
            </h2>

            <p className="mb-6">
                Manage all your payments from one simple dashboard.
            </p>

            <Link href="/signup">
                <button className="bg-white text-blue-600 px-6 py-3 rounded cursor-pointer">
                    Join Now
                </button>
            </Link>

        </section>
    )
}
