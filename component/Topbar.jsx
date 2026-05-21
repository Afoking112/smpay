"use client";

import Image from 'next/image';
import { useApolloClient } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiShield, FiUser } from 'react-icons/fi';
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
        <div className="sticky top-4 z-30">
            <div className="app-card flex flex-col gap-4 rounded-[1.75rem] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7df2c8]">
                        {user?.role === 'admin' ? 'Admin workspace' : 'User workspace'}
                    </p>
                    <h1 className="mt-2 truncate text-xl font-semibold text-white sm:text-2xl">
                        {user ? `Welcome back, ${user.name}` : 'Dashboard'}
                    </h1>
                    <p className="mt-1 truncate text-sm text-[#8ea4ba]">
                        {user?.email || 'Manage your wallet, payments, and purchases.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <div className="app-pill inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#dce6f0]">
                        {user?.role === 'admin' ? <FiShield className="text-[#7df2c8]" /> : <FiUser className="text-[#7df2c8]" />}
                        {user?.role || 'user'}
                    </div>
                    <div className="app-pill inline-flex items-center gap-3 rounded-full px-3 py-2">
                        <Image
                            src={avatarSrc}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                            alt={user?.name || 'user'}
                            unoptimized
                        />
                        <div className="hidden text-left sm:block">
                            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                            <p className="text-xs text-[#8ea4ba]">{user?.role || 'user'}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="button-secondary px-4 py-3 text-sm"
                    >
                        <FiLogOut />
                        Log out
                    </button>
                </div>
            </div>
        </div>
    );
}
