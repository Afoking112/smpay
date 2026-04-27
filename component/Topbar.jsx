"use client";

import Image from 'next/image';
import { useApolloClient } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { clearAuthSession } from '@/utils/auth';

export default function Topbar({ user }) {
    const client = useApolloClient();
    const router = useRouter();
    const avatarSrc = user?.profilePicture || '/avatar.png';

    const handleLogout = async () => {
        clearAuthSession();
        await client.clearStore();
        router.replace(user?.role === 'admin' ? '/admin/login' : '/login');
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
                <div className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 sm:block">
                    {user?.role || 'user'}
                </div>
                <Image
                    src={avatarSrc}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                    alt={user?.name || 'user'}
                    unoptimized
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
