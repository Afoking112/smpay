import Link from 'next/link';
import { FiHome, FiClock, FiZap, FiGift, FiActivity, FiMessageSquare, FiUser } from "react-icons/fi";

const links = [
    { href: '/dashboard', icon: FiHome, label: 'Dashboard Home' },
    { href: '/profile', icon: FiUser, label: 'Profile Update' },
    { href: '/messages', icon: FiMessageSquare, label: 'Support' },
    { href: '/dashboard#transactions-section', icon: FiClock, label: 'Transactions' },
    { href: '/dashboard#service-center', icon: FiZap, label: 'Service Center' },
    { href: '/dashboard#service-requests', icon: FiGift, label: 'Service Requests' },
    { href: '/status', icon: FiActivity, label: 'System Status' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
            <h2 className="text-2xl font-bold text-blue-600 mb-8">
                SM Pay
            </h2>

            <ul className="space-y-4">
                {links.map(({ href, icon: Icon, label }) => (
                    <li key={label}>
                        <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600">
                            <Icon />
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
