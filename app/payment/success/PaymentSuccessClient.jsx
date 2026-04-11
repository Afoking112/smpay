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
            <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="max-w-lg rounded-2xl bg-white p-8 shadow">
                    <h1 className="text-2xl font-bold text-gray-900">Missing payment reference</h1>
                    <p className="mt-3 text-sm text-gray-600">
                        We could not find the Paystack reference in this URL, so we cannot verify the funding yet.
                    </p>
                    <Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="max-w-xl rounded-2xl bg-white p-8 shadow">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Wallet Funding</p>
                <h1 className="mt-3 text-3xl font-bold text-gray-900">
                    {loading ? 'Confirming your payment...' : error ? 'Payment verification needs attention' : 'Wallet funded successfully'}
                </h1>

                <p className="mt-4 text-sm text-gray-600">
                    {loading
                        ? 'Please wait while we verify the Paystack transaction and update your wallet balance.'
                        : error
                            ? error.message
                            : 'Your payment has been verified and your wallet is ready to use.'}
                </p>

                <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                    <p>Reference: {reference}</p>
                    {transaction ? <p className="mt-2">Amount: {formatCurrency(transaction.amount)}</p> : null}
                    {transaction?.status ? <p className="mt-2">Status: {transaction.status}</p> : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/dashboard" className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                        Go to Dashboard
                    </Link>
                    {error ? (
                        <Link href={`/payment/failed?ref=${encodeURIComponent(reference)}`} className="inline-flex rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
                            Open Help Page
                        </Link>
                    ) : null}
                </div>
            </div>
        </main>
    );
}
