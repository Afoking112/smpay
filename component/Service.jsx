const services = [
    {
        title: "Airtime Top-up",
        desc: "Buy airtime instantly for all networks"
    },
    {
        title: "Cable TV",
        desc: "Renew your cable TV subscription"
    },
    {
        title: "Electricity Bills",
        desc: "Pay electricity bills easily"
    },
    {
        title: "Betting",
        desc: "Fund betting wallets instantly"
    },
    {
        title: "Data Top-up",
        desc: "Buy data bundles in seconds"
    },
    {
        title: "Gift Card",
        desc: "Buy or sell your Gift card in seconds"
    }
]

export default function Services() {
    return (
        <section className="py-20 px-10 bg-gray-50">

            <div className="max-w-6xl mx-auto text-center mb-14">
                <h2 className="text-3xl font-bold">
                    What Can You Pay With SM Pay?
                </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

                {services.map((service, i) => (
                    <div key={i} className="bg-white shadow p-6 rounded">

                        <h3 className="text-xl font-semibold mb-2">
                            {service.title}
                        </h3>

                        <p className="text-gray-500">
                            {service.desc}
                        </p>

                    </div>
                ))}

            </div>

        </section>
    )
}