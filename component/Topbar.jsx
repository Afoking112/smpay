"use client";

import Image from 'next/image';
import { useApolloClient } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { clearAuthSession } from '@/utils/auth';

export default function Topbar({ user }) {
    const client = useApolloClient();
    const router = useRouter();

    const handleLogout = async () => {
        clearAuthSession();
        await client.clearStore();
        router.replace('/login');
    };

    return (
        <div className="flex justify-between items-center bg-white px-6 py-4 shadow">
            <div>
                <h1 className="text-xl font-semibold">
                    {user ? `Welcome back, ${user.name}` : 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                    {user?.email || 'Manage your wallet, payments, and purchases.'}
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Image
                    src="/avatar.png"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                    alt="user"
                />
                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                    Log out
                </button>
            </div>
        </div>
    );
}
