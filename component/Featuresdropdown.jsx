import Link from 'next/link';
import { FiZap, FiCreditCard, FiGift, FiPhone } from "react-icons/fi";

const items = [
    {
        href: '/signup',
        icon: FiPhone,
        title: 'Buy Airtime',
        description: 'Create an account and top up instantly.',
    },
    {
        href: '/dashboard',
        icon: FiCreditCard,
        title: 'Buy Data',
        description: 'Use the dashboard quick actions for data bundles.',
    },
    {
        href: '/about',
        icon: FiZap,
        title: 'Pay Bills',
        description: 'See the platform roadmap and service direction.',
    },
    {
        href: '/contact',
        icon: FiGift,
        title: 'Talk to Us',
        description: 'Reach support for partnerships or product help.',
    },
];

export default function FeaturesDropdown() {
    return (
        <div className="relative group">
            <button className="flex items-center gap-1 hover:text-blue-600 transition">
                Features
                <span className="text-xs transition-transform duration-300 group-hover:rotate-180">
                    v
                </span>
            </button>

            <div className="absolute left-0 mt-4 w-72 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                <div className="p-2">
                    {items.map(({ href, icon: Icon, title, description }) => (
                        <Link key={title} href={href} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition">
                            <Icon className="text-blue-600 text-xl mt-1" />
                            <div>
                                <p className="font-medium">{title}</p>
                                <p className="text-sm text-gray-500">{description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
