"use client";

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ME_QUERY } from '@/lib/queries';
import WalletCard from "@/component/Walletcard";
import QuickServices from "@/component/QuickService";
import Transactions from "@/component/TransactionTable";
import FundWalletModal from "@/component/FundWalletModal";
import WithdrawModal from "@/component/WithdrawModal";
import ServicePurchasePanel from "@/component/ServicePurchasePanel";
import ServiceRequestHistory from "@/component/ServiceRequestHistory";
import UserShell from "@/component/UserShell";
import { clearAuthSession, getStoredToken } from '@/utils/auth';

export default function Dashboard() {
    const router = useRouter();
    const [isFundWalletOpen, setIsFundWalletOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [activeService, setActiveService] = useState('airtime');
    const token = useSyncExternalStore(
        () => () => { },
        getStoredToken,
        () => ''
    );
    const hasToken = Boolean(token);

    const { data: userData, loading, error } = useQuery(ME_QUERY, {
        skip: !hasToken,
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        if (!hasToken) {
            router.replace('/login?redirect=/dashboard');
        }
    }, [hasToken, router]);

    useEffect(() => {
        if (hasToken && !loading && !error && !userData?.me) {
            clearAuthSession();
            router.replace('/login?redirect=/dashboard');
        }
    }, [error, hasToken, loading, router, userData]);

    if (!hasToken || loading) {
        return (
            <div className="app-shell-bg app-shell-grid flex min-h-screen items-center justify-center px-4">
                <div className="app-card rounded-[2rem] px-8 py-6 text-center text-white">
                    <p className="text-lg font-semibold">Loading your dashboard...</p>
                    <p className="mt-2 text-sm text-[#8ea4ba]">Fetching your account.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-shell-bg app-shell-grid flex min-h-screen items-center justify-center px-4">
                <div className="app-card max-w-lg rounded-[2rem] p-8 text-white">
                    <h1 className="text-2xl font-bold text-white">We could not load your dashboard</h1>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="button-primary px-4 py-2 text-sm"
                        >
                            Try Again
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                clearAuthSession();
                                router.replace('/login');
                            }}
                            className="button-secondary px-4 py-2 text-sm"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData?.me) {
        return null;
    }

    return (
        <UserShell
            user={userData.me}
            title={`Welcome back, ${userData.me.name}!`}
            description="Your main SM PAY workspace now carries the same 3D style as the landing experience, with wallet actions, services, requests, and transaction visibility in one responsive flow."
        >
            <WalletCard
                onFundWallet={() => setIsFundWalletOpen(true)}
                onWithdraw={() => setIsWithdrawOpen(true)}
            />

            <div className="grid gap-6 xl:grid-cols-[0.78fr,0.22fr]">
                <div id="service-center" className="space-y-6">
                    <section className="app-card rounded-[1.75rem] p-6 text-white">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7df2c8]">Service Center</p>
                                <h2 className="mt-3 text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                                    Launch your next payment action.
                                </h2>
                                <p className="mt-2 text-sm leading-7 text-[#8ea4ba]">
                                    Instant top-ups and tracked request services now sit inside the same responsive control surface.
                                </p>
                            </div>
                            <div className="app-subcard rounded-[1.25rem] px-4 py-3 text-sm text-[#b7c6d7]">
                                Active flow: <span className="font-semibold text-white">{activeService || 'None selected'}</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <QuickServices selectedService={activeService} onSelectService={setActiveService} />
                        </div>
                    </section>
                    <ServicePurchasePanel service={activeService} onClose={() => setActiveService('')} />
                </div>

                <section className="app-card-soft rounded-[1.75rem] p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00d5ff]">Workspace cues</p>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-[#b7c6d7]">
                        <div className="app-subcard rounded-[1.25rem] p-4">
                            Keep balance control close to service actions so repeat payments feel fast.
                        </div>
                        <div className="app-subcard rounded-[1.25rem] p-4">
                            Use the support page for gift card conversations and admin follow-up.
                        </div>
                        <div className="app-subcard rounded-[1.25rem] p-4">
                            Transaction and request history stay visible below for easier verification.
                        </div>
                    </div>
                </section>
            </div>

            <Transactions />
            <div id="service-requests">
                <ServiceRequestHistory />
            </div>
            <FundWalletModal isOpen={isFundWalletOpen} onClose={() => setIsFundWalletOpen(false)} />
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
        </UserShell>
    );
}
