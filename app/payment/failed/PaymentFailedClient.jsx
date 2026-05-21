"use client";

import Link from 'next/link';
import AuthPageShell from '@/component/AuthPageShell';

export default function PaymentFailedClient({ reference }) {
    return (
        <AuthPageShell
            badge="Payment Support"
            title="We could not confirm that payment yet."
            description="This usually means the payment is still pending, the callback was interrupted, or the backend could not finish verification."
            accentTitle="What to do next"
            accentBody="You can return to the dashboard and try again once the transaction settles. If support needs to step in, keep the payment reference close."
            highlights={[
                'Pending payments can take a little time to settle.',
                'Interrupted callbacks can prevent the wallet from updating instantly.',
                'The payment reference helps support trace what happened faster.',
            ]}
        >
            <div className="space-y-6">
                {reference ? (
                    <div className="app-subcard rounded-[1.5rem] p-4 text-sm text-[#dce6f0]">
                        Reference: {reference}
                    </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard" className="button-primary px-5 py-3 text-sm">
                        Back to Dashboard
                    </Link>
                    <Link href="/login" className="button-secondary px-5 py-3 text-sm">
                        Back to Login
                    </Link>
                </div>
            </div>
        </AuthPageShell>
    );
}
