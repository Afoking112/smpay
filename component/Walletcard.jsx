"use client";

import { useQuery } from '@apollo/client/react';
import { WALLET_BALANCE_QUERY } from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';

export default function WalletCard({ onFundWallet }) {
    const { data, loading } = useQuery(WALLET_BALANCE_QUERY);

    const balance = data?.walletBalance || 0;

    if (loading) {
        return (
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg animate-pulse">
                <div className="h-4 bg-blue-500 rounded w-32 mb-4"></div>
                <div className="h-12 bg-blue-500 rounded w-24 mb-6"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg">Wallet Balance</h2>
            <p className="text-3xl font-bold mt-2">{formatCurrency(balance)}</p>
            <div className="mt-4 flex gap-4">
                <button
                    type="button"
                    className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition"
                    onClick={onFundWallet}
                >
                    Fund Wallet
                </button>
                <button
                    type="button"
                    className="border border-white text-white px-4 py-2 rounded font-medium hover:bg-white hover:text-blue-600 transition"
                    onClick={() => document.getElementById('transactions-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    View Transactions
                </button>
            </div>
        </div>
    );
}
