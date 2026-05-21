import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function CTA() {
    return (
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="surface-panel-hero mx-auto max-w-7xl rounded-[2.25rem] p-8 text-white sm:p-10 lg:p-12">
                <div className="grid gap-8 lg:grid-cols-[0.66fr,0.34fr] lg:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7df2c8]">Ready to start</p>
                        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                            Keep the same premium feel after the landing page.
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#b7c6d7] sm:text-lg">
                            Create an account, fund your wallet, launch services, and stay on top of support and transaction visibility from one SM PAY flow.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <Link href="/signup" className="button-primary px-6 py-4 text-base">
                            Join SM PAY
                            <FiArrowRight />
                        </Link>
                        <Link href="/contact" className="button-secondary px-6 py-4 text-base">
                            Talk to support
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
