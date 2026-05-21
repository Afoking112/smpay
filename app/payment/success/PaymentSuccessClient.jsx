"use client";

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import {
    TRANSACTIONS_QUERY,
    VERIFY_WALLET_FUNDING_MUTATION,
    WALLET_BALANCE_QUERY,
} from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';
import AuthPageShell from '@/component/AuthPageShell';

export default function PaymentSuccessClient({ reference }) {
    const hasRequested = useRef(false);
    const [verifyWalletFunding, { data, loading, error }] = useMutation(VERIFY_WALLET_FUNDING_MUTATION, {
        refetchQueries: [{ query: WALLET_BALANCE_QUERY }, { query: TRANSACTIONS_QUERY }],
        awaitRefetchQueries: true,
    });

    useEffect(() => {
        if (!reference || hasRequested.current) {
            return;
        }

        hasRequested.current = true;
        verifyWalletFunding({ variables: { reference } }).catch(() => {});
    }, [reference, verifyWalletFunding]);

    const transaction = data?.verifyWalletFunding?.transaction;

    if (!reference) {
        return (
            <AuthPageShell
                badge="Payment Follow-up"
                title="We need a payment reference."
                description="The success return route could not find the Paystack reference in the URL, so wallet verification cannot start yet."
                accentTitle="Why you are seeing this"
                accentBody="This usually means the callback URL was opened without the required payment reference. Returning to the dashboard is the safest next step."
                highlights={[
                    'Payment verification depends on the Paystack reference.',
                    'Wallet balance cannot update until the reference is checked.',
                    'You can safely return to the dashboard and retry from there.',
                ]}
            >
                <div className="space-y-6">
                    <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>Missing payment reference</h1>
                    <p className="text-sm leading-7 text-[#9ab0c5]">
                        We could not find the Paystack reference in this URL, so we cannot verify the funding yet.
                    </p>
                    <Link href="/dashboard" className="button-primary px-5 py-3 text-sm">
                        Back to Dashboard
                    </Link>
                </div>
            </AuthPageShell>
        );
    }

    return (
        <AuthPageShell
            badge="Wallet Funding"
            title={loading ? 'Confirming your payment...' : error ? 'Payment verification needs attention' : 'Wallet funded successfully.'}
            description={loading
                ? 'Please wait while SM PAY verifies the Paystack transaction and updates your wallet balance.'
                : error
                    ? error.message
                    : 'Your payment has been verified and your wallet is ready to use.'}
            accentTitle="Verification status"
            accentBody="This return page is now visually aligned with the rest of the SM PAY experience while still giving clear transaction feedback."
            highlights={[
                'Funding status is checked before the wallet view updates.',
                'The payment reference stays visible for support follow-up.',
                'You can jump straight back into the dashboard once verification completes.',
            ]}
        >
            <div className="space-y-6">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7df2c8]">Wallet Funding</p>
                <div className="app-subcard rounded-[1.5rem] p-4 text-sm text-[#dce6f0]">
                    <p>Reference: {reference}</p>
                    {transaction ? <p className="mt-2">Amount: {formatCurrency(transaction.amount)}</p> : null}
                    {transaction?.status ? <p className="mt-2">Status: {transaction.status}</p> : null}
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard" className="button-primary px-5 py-3 text-sm">
                        Go to Dashboard
                    </Link>
                    {error ? (
                        <Link href={`/payment/failed?ref=${encodeURIComponent(reference)}`} className="button-secondary px-5 py-3 text-sm">
                            Open Help Page
                        </Link>
                    ) : null}
                </div>
            </div>
        </AuthPageShell>
    );
}
