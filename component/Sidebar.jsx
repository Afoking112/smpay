"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGift, FiHome, FiMessageSquare, FiUser, FiZap } from "react-icons/fi";

const desktopLinks = [
    { href: '/dashboard', match: '/dashboard', icon: FiHome, label: 'Dashboard Home' },
    { href: '/profile', match: '/profile', icon: FiUser, label: 'Profile Update' },
    { href: '/messages', match: '/messages', icon: FiMessageSquare, label: 'Support' },
    { href: '/dashboard#service-center', match: '/dashboard', icon: FiZap, label: 'Service Center' },
    { href: '/dashboard#service-requests', match: '/dashboard', icon: FiGift, label: 'Service Requests' },
];

const mobileLinks = [
    { href: '/dashboard', match: '/dashboard', icon: FiHome, label: 'Home' },
    { href: '/profile', match: '/profile', icon: FiUser, label: 'Profile' },
    { href: '/messages', match: '/messages', icon: FiMessageSquare, label: 'Support' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 self-start px-6 lg:block">
                <div className="app-card flex h-full flex-col rounded-[2rem] p-6 text-white">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0d1a2b] text-sm font-semibold tracking-[0.24em] text-[#7df2c8] ring-1 ring-white/10">
                            SM
                        </span>
                        <div>
                            <p className="text-sm font-semibold tracking-[0.16em] text-white">SM PAY</p>
                            <p className="text-xs text-[#8ea4ba]">User command deck</p>
                        </div>
                    </Link>

                    <div className="mt-8 space-y-2">
                        {desktopLinks.map(({ href, match, icon: Icon, label }) => {
                            const isActive = !href.includes('#') && pathname === match;

                            return (
                                <Link
                                    key={`${href}-${label}`}
                                    href={href}
                                    className={`flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm transition ${
                                        isActive
                                            ? 'bg-[#7df2c8]/12 text-white ring-1 ring-[#7df2c8]/25'
                                            : 'text-[#b7c6d7] hover:bg-white/6 hover:text-white'
                                    }`}
                                >
                                    <Icon className={isActive ? 'text-[#7df2c8]' : 'text-[#8ea4ba]'} />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="app-subcard mt-auto rounded-[1.5rem] p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#7df2c8]">Command center</p>
                        <p className="mt-3 text-sm leading-7 text-[#b7c6d7]">
                            Launch payments, follow support, and track service activity from one responsive dashboard flow.
                        </p>
                    </div>
                </div>
            </aside>

            <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
                <nav className="app-card flex items-center justify-between rounded-[1.75rem] px-3 py-3">
                    {mobileLinks.map(({ href, match, icon: Icon, label }) => {
                        const isActive = pathname === match;

                        return (
                            <Link
                                key={`${href}-${label}`}
                                href={href}
                                className={`flex min-w-0 flex-1 flex-col items-center gap-2 rounded-[1.1rem] px-2 py-2 text-xs font-medium transition ${
                                    isActive ? 'bg-[#7df2c8]/12 text-white' : 'text-[#8ea4ba]'
                                }`}
                            >
                                <Icon className={isActive ? 'text-[#7df2c8]' : 'text-[#8ea4ba]'} />
                                <span className="truncate">{label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
