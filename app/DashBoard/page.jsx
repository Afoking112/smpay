"use client";

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ME_QUERY } from '@/lib/queries';
import Sidebar from "@/component/Sidebar";
import Topbar from "@/component/Topbar";
import WalletCard from "@/component/Walletcard";
import QuickServices from "@/component/QuickService";
import Transactions from "@/component/TransactionTable";
import FundWalletModal from "@/component/FundWalletModal";
import ServicePurchasePanel from "@/component/ServicePurchasePanel";
import ServiceRequestHistory from "@/component/ServiceRequestHistory";
import { clearAuthSession, getStoredToken } from '@/utils/auth';

export default function Dashboard() {
    const router = useRouter();
    const [isFundWalletOpen, setIsFundWalletOpen] = useState(false);
    const [activeService, setActiveService] = useState('airtime');
    const token = useSyncExternalStore(
        () => () => {},
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
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="rounded-2xl bg-white px-8 py-6 text-center shadow">
                    <p className="text-lg font-semibold text-gray-900">Loading your dashboard...</p>
                    <p className="mt-2 text-sm text-gray-500">Checking your session and fetching your account.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="max-w-lg rounded-2xl bg-white p-8 shadow">
                    <h1 className="text-2xl font-bold text-gray-900">We could not load your dashboard</h1>
                    <p className="mt-3 text-sm text-gray-600">
                        Your session looks valid, but the app could not reach the backend. This usually happens when the database connection or API credentials still need attention.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                clearAuthSession();
                                router.replace('/login');
                            }}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
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
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="flex-1">
                <Topbar user={userData.me} />

                <div className="p-6 space-y-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                        <h1 className="text-2xl font-bold">Welcome back, {userData.me.name}!</h1>
                        <p className="opacity-90">Here&apos;s what&apos;s happening with your account today.</p>
                    </div>

                    <WalletCard onFundWallet={() => setIsFundWalletOpen(true)} />
                    <div id="service-center" className="space-y-6">
                        <QuickServices selectedService={activeService} onSelectService={setActiveService} />
                        <ServicePurchasePanel service={activeService} onClose={() => setActiveService('')} />
                    </div>
                    <Transactions />
                    <div id="service-requests">
                        <ServiceRequestHistory />
                    </div>
                    <FundWalletModal isOpen={isFundWalletOpen} onClose={() => setIsFundWalletOpen(false)} />
                </div>
            </div>
        </div>
    );
}
