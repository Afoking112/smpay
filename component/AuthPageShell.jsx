import Link from 'next/link';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function AuthPageShell({
    badge,
    title,
    description,
    accentTitle,
    accentBody,
    highlights = [],
    children,
}) {
    return (
        <main className="public-aurora public-grid min-h-screen px-4 py-8 text-[#f3f8ff] sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <header className="surface-panel-soft rounded-full px-5 py-3 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d1a2b] text-sm font-semibold tracking-[0.24em] text-[#7df2c8] ring-1 ring-white/10">
                                SM
                            </span>
                            <div>
                                <p className="text-sm font-semibold tracking-[0.16em] text-white">SM PAY</p>
                                <p className="text-xs text-[#8ea4ba]">Secure account access</p>
                            </div>
                        </Link>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link href="/contact" className="button-secondary px-4 py-2 text-sm">
                                Contact
                            </Link>
                            <Link href="/" className="button-primary px-4 py-2 text-sm">
                                Back Home
                                <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr] xl:items-stretch">
                    <section className="surface-panel-hero reveal-up overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-12">
                        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] surface-badge">
                            {badge}
                        </div>

                        <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-display)' }}>
                            {title}
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-8 text-[#b7c6d7] sm:text-lg">
                            {description}
                        </p>

                        <div className="mt-10 grid gap-4">
                            {highlights.map((item, index) => (
                                <div
                                    key={item}
                                    className="surface-panel-soft reveal-up flex items-start gap-3 rounded-[1.5rem] px-4 py-4"
                                    style={{ animationDelay: `${index * 80 + 140}ms` }}
                                >
                                    <FiCheckCircle className="mt-0.5 text-[#7df2c8]" />
                                    <p className="text-sm leading-7 text-[#dbe5ef]">{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#8aa0b7]">{accentTitle}</p>
                            <p className="mt-4 text-sm leading-7 text-[#dce6f0]">{accentBody}</p>
                        </div>
                    </section>

                    <section className="surface-panel-dark reveal-up rounded-[2rem] p-6 sm:p-8 lg:p-10" style={{ animationDelay: '120ms' }}>
                        {children}
                    </section>
                </div>
            </div>
        </main>
    );
}
