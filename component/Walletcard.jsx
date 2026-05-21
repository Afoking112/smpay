"use client";

import { useQuery } from '@apollo/client/react';
import { FiArrowDownLeft, FiArrowUpRight, FiClock } from 'react-icons/fi';
import { WALLET_BALANCE_QUERY } from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';

export default function WalletCard({ onFundWallet, onWithdraw }) {
    const { data, loading } = useQuery(WALLET_BALANCE_QUERY);

    const balance = data?.walletBalance || 0;

    if (loading) {
        return (
            <div className="app-card-hero animate-pulse rounded-[2rem] p-6 sm:p-8">
                <div className="h-4 w-32 rounded-full bg-white/10"></div>
                <div className="mt-5 h-12 w-40 rounded-full bg-white/10"></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="h-14 rounded-[1.2rem] bg-white/8"></div>
                    <div className="h-14 rounded-[1.2rem] bg-white/8"></div>
                    <div className="h-14 rounded-[1.2rem] bg-white/8"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-card-hero rounded-[2rem] p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7df2c8]">Wallet Balance</p>
                    <p className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
                        {formatCurrency(balance)}
                    </p>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#b7c6d7]">
                        Fund your wallet, launch services, or track recent payment activity from one central balance view.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <button type="button" className="button-primary px-5 py-3 text-sm" onClick={onFundWallet}>
                        <FiArrowUpRight />
                        Fund Wallet
                    </button>
                    <button type="button" className="button-secondary px-5 py-3 text-sm" onClick={onWithdraw}>
                        <FiArrowDownLeft />
                        Withdraw
                    </button>
                    <button
                        type="button"
                        className="button-secondary px-5 py-3 text-sm"
                        onClick={() => document.getElementById('transactions-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <FiClock />
                        View Transactions
                    </button>
                </div>
            </div>
        </div>
    );
}
