"use client";

import { useEffect, useSyncExternalStore } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ME_QUERY } from '@/lib/queries';
import { clearAuthSession, getStoredToken, subscribeToAuthToken } from '@/utils/auth';

export default function useSessionUser({ redirectTo = '/login', requiredRole } = {}) {
    const router = useRouter();
    const token = useSyncExternalStore(
        subscribeToAuthToken,
        getStoredToken,
        () => ''
    );
    const hasToken = Boolean(token);

    const query = useQuery(ME_QUERY, {
        skip: !hasToken,
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        if (!hasToken) {
            router.replace(redirectTo);
        }
    }, [hasToken, redirectTo, router]);

    useEffect(() => {
        if (!hasToken || query.loading) {
            return;
        }

        if (query.error) {
            clearAuthSession();
            router.replace(redirectTo);
            return;
        }

        const currentUser = query.data?.me;

        if (!currentUser) {
            clearAuthSession();
            router.replace(redirectTo);
            return;
        }

        if (requiredRole && currentUser.role !== requiredRole) {
            router.replace(currentUser.role === 'admin' ? '/admin' : '/dashboard');
        }
    }, [hasToken, query.data, query.error, query.loading, redirectTo, requiredRole, router]);

    return {
        ...query,
        hasToken,
        token,
        user: query.data?.me ?? null,
    };
}

