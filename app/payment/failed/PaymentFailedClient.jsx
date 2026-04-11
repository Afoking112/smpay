"use client";

import Link from 'next/link';

export default function PaymentFailedClient({ reference }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="max-w-xl rounded-2xl bg-white p-8 shadow">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-500">Payment Support</p>
                <h1 className="mt-3 text-3xl font-bold text-gray-900">We could not confirm that payment yet</h1>
                <p className="mt-4 text-sm text-gray-600">
                    This usually means the payment is still pending, the callback was interrupted, or the backend could not finish verification. You can return to the dashboard and try again once the transaction settles.
                </p>
                {reference ? (
                    <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                        Reference: {reference}
                    </div>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/dashboard" className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                        Back to Dashboard
                    </Link>
                    <Link href="/login" className="inline-flex rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
                        Back to Login
                    </Link>
                </div>
            </div>
        </main>
    );
}
