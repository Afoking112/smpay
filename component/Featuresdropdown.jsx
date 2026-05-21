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
            <button className="flex items-center gap-1 transition hover:text-[#7df2c8]">
                Features
                <span className="text-xs transition-transform duration-300 group-hover:rotate-180">
                    v
                </span>
            </button>

            <div className="surface-panel-dark absolute left-0 mt-4 w-80 rounded-[1.5rem] opacity-0 invisible translate-y-3 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="p-2">
                    {items.map(({ href, icon: Icon, title, description }) => (
                        <Link key={title} href={href} className="flex items-start gap-3 rounded-[1.1rem] p-3 transition hover:bg-white/6">
                            <Icon className="mt-1 text-xl text-[#7df2c8]" />
                            <div>
                                <p className="font-medium text-white">{title}</p>
                                <p className="text-sm text-[#8ea4ba]">{description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
