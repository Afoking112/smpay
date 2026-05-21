import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl border-t border-white/10 pt-8">
                <div className="flex flex-col gap-5 text-sm text-[#8ea4ba] md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="font-semibold text-white">SM PAY</p>
                        <p className="mt-1">Wallet funding, top-ups, support threads, and tracked payment visibility in one experience.</p>
                    </div>
                    <div className="flex flex-wrap gap-5">
                        <Link href="/" className="transition hover:text-white">Home</Link>
                        <Link href="/about" className="transition hover:text-white">About</Link>
                        <Link href="/contact" className="transition hover:text-white">Contact</Link>
                        <Link href="/login" className="transition hover:text-white">Login</Link>
                    </div>
                </div>
                <p className="mt-6 text-xs text-[#6f8399]">Copyright 2026 SM PAY. All rights reserved.</p>
            </div>
        </footer>
    );
}
