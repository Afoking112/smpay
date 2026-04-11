export default function Newsletter() {
    return (
        <section className="py-20 px-10 bg-gray-100 text-center">

            <h2 className="text-3xl font-bold mb-4">
                Join Our Newsletter
            </h2>

            <p className="mb-6">
                Get updates on new features and offers.
            </p>

            <div className="flex justify-center gap-4">

                <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-2 border rounded w-72"
                />

                <button className="bg-blue-600 text-white px-6 py-2 rounded">
                    Subscribe
                </button>

            </div>

        </section>
    )
}