"use client";

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import Topbar from '@/component/Topbar';
import {
    ADMIN_REPLY_SUPPORT_MESSAGE_MUTATION,
    ADMIN_SUPPORT_MESSAGES_QUERY,
    ADMIN_USER_QUERY,
    ADMIN_USERS_QUERY,
    DELETE_USER_MUTATION,
    UPDATE_SUPPORT_MESSAGE_STATUS_MUTATION,
} from '@/lib/queries';
import useSessionUser from '@/utils/useSessionUser';

function formatCurrency(amount = 0) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 2,
    }).format(amount);
}

function buildWhatsappLink(phone, name) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) {
        return '';
    }

    const normalized = digits.length === 11 && digits.startsWith('0')
        ? `234${digits.slice(1)}`
        : digits;

    return `https://wa.me/${normalized}?text=${encodeURIComponent(`Hello ${name || 'there'}, I am following up from SM Pay support.`)}`;
}

function buildTelegramLink(handle) {
    const normalized = String(handle || '').trim().replace(/^@/, '');
    return normalized ? `https://t.me/${normalized}` : '';
}

function AdminLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <div className="rounded-2xl bg-white px-8 py-6 text-center shadow">
                <p className="text-lg font-semibold text-gray-900">Loading admin monitor...</p>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const client = useApolloClient();
    const { hasToken, loading, error: sessionError, user } = useSessionUser({
        redirectTo: '/admin/login',
        requiredRole: 'admin',
    });
    const [search, setSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useQuery(ADMIN_USERS_QUERY, {
        variables: { search },
        skip: !hasToken,
        fetchPolicy: 'network-only',
    });
    const { data: adminMessagesData, loading: adminMessagesLoading, refetch: refetchAdminMessages } = useQuery(ADMIN_SUPPORT_MESSAGES_QUERY, {
        variables: { limit: 20 },
        skip: !hasToken,
        fetchPolicy: 'network-only',
    });
    const users = useMemo(() => usersData?.adminUsers ?? [], [usersData]);
    const adminMessages = useMemo(() => adminMessagesData?.adminSupportMessages ?? [], [adminMessagesData]);
    const activeUserId = selectedUserId && users.some((item) => item.id === selectedUserId)
        ? selectedUserId
        : users[0]?.id || '';
    const { data: selectedUserData, loading: selectedUserLoading, refetch: refetchSelectedUser } = useQuery(ADMIN_USER_QUERY, {
        variables: { id: activeUserId },
        skip: !hasToken || !activeUserId,
        fetchPolicy: 'network-only',
    });
    const [deleteUser, { loading: deletingUser }] = useMutation(DELETE_USER_MUTATION);
    const [updateSupportMessageStatus] = useMutation(UPDATE_SUPPORT_MESSAGE_STATUS_MUTATION);
    const [adminReplySupportMessage, { loading: sendingReply }] = useMutation(ADMIN_REPLY_SUPPORT_MESSAGE_MUTATION);
    const [replyForm, setReplyForm] = useState({
        category: 'Gift Card',
        preferredChannel: 'Email',
        message: '',
    });
    const selectedUser = activeUserId ? selectedUserData?.adminUser?.user ?? null : null;
    const selectedTransactions = activeUserId ? selectedUserData?.adminUser?.transactions ?? [] : [];
    const selectedRequests = activeUserId ? selectedUserData?.adminUser?.serviceRequests ?? [] : [];
    const selectedMessages = activeUserId ? selectedUserData?.adminUser?.supportMessages ?? [] : [];

    if (!hasToken || loading) {
        return <AdminLoading />;
    }

    if (sessionError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
                <div className="rounded-2xl bg-white p-8 shadow">
                    <p className="text-lg font-semibold text-gray-900">We could not load the admin monitor.</p>
                    <p className="mt-2 text-sm text-gray-500">{sessionError.message}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const totalWalletBalance = users.reduce((sum, item) => sum + (item.walletBalance || 0), 0);
    const totalTransactions = users.reduce((sum, item) => sum + (item.transactionCount || 0), 0);
    const unreadMessages = adminMessages.filter((message) => message.status === 'Unread').length;
    const totalServiceRequests = users.reduce((sum, item) => sum + (item.serviceRequestCount || 0), 0);

    const refreshAll = async () => {
        await Promise.all([
            refetchUsers({ search }),
            refetchAdminMessages({ limit: 20 }),
            activeUserId ? refetchSelectedUser({ id: activeUserId }) : Promise.resolve(),
            client.refetchQueries({ include: ['Me'] }),
        ]);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) {
            return;
        }

        const confirmed = window.confirm(`Delete ${selectedUser.name} and all related records?`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteUser({ variables: { userId: selectedUser.id } });
            setSelectedUserId('');
            await Promise.all([refetchUsers({ search }), refetchAdminMessages({ limit: 20 })]);
        } catch (mutationError) {
            window.alert(mutationError.message);
        }
    };

    const handleMessageStatus = async (messageId, status) => {
        try {
            await updateSupportMessageStatus({
                variables: { messageId, status },
            });
            await refreshAll();
        } catch (mutationError) {
            window.alert(mutationError.message);
        }
    };

    const handleAdminReply = async (event) => {
        event.preventDefault();

        if (!selectedUser || !replyForm.message.trim()) {
            return;
        }

        try {
            await adminReplySupportMessage({
                variables: {
                    userId: selectedUser.id,
                    input: {
                        subject: replyForm.category === 'Gift Card' ? 'Gift card live chat reply' : 'Support reply',
                        category: replyForm.category,
                        preferredChannel: replyForm.preferredChannel,
                        message: replyForm.message,
                    },
                },
            });

            setReplyForm((current) => ({
                ...current,
                message: '',
            }));
            await refreshAll();
        } catch (mutationError) {
            window.alert(mutationError.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Topbar user={user} />

            <div className="space-y-6 p-6">
                <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-bold">Admin Monitor</h1>
                    <p className="mt-2 max-w-3xl text-sm text-slate-200">
                        Search users, inspect their transactions and requests, review support alerts, and delete accounts when needed.
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-white p-5 shadow">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Users</p>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{users.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Wallet Value</p>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{formatCurrency(totalWalletBalance)}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Unread Messages</p>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{unreadMessages}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-600">Tracked Activity</p>
                        <p className="mt-3 text-3xl font-bold text-gray-900">{totalTransactions + totalServiceRequests}</p>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
                    <div className="rounded-3xl bg-white p-5 shadow">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                                <p className="mt-1 text-sm text-gray-500">Click any user to inspect the account.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => refetchUsers({ search })}
                                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                                Refresh
                            </button>
                        </div>

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name, email, phone, or state"
                            className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <div className="mt-4 space-y-3">
                            {usersLoading ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                                    Loading users...
                                </div>
                            ) : null}

                            {!usersLoading && users.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                                    No users match the current search.
                                </div>
                            ) : null}

                            {users.map((account) => (
                                <button
                                    key={account.id}
                                    type="button"
                                    onClick={() => setSelectedUserId(account.id)}
                                    className={`w-full rounded-2xl border p-4 text-left transition ${
                                        activeUserId === account.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {account.profilePicture ? (
                                            <Image
                                                src={account.profilePicture}
                                                alt={account.name}
                                                width={48}
                                                height={48}
                                                className="h-12 w-12 rounded-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-700">
                                                {account.name.slice(0, 1).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-gray-900">{account.name}</p>
                                            <p className="truncate text-sm text-gray-500">{account.email}</p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                                <span>{account.transactionCount || 0} txns</span>
                                                <span>{account.serviceRequestCount || 0} requests</span>
                                                <span>{account.supportMessageCount || 0} messages</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl bg-white p-6 shadow">
                            {selectedUserLoading ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                                    Loading selected user...
                                </div>
                            ) : null}

                            {!selectedUserLoading && !selectedUser ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                                    Select a user from the left to inspect their transactions, service requests, and support messages.
                                </div>
                            ) : null}

                            {selectedUser ? (
                                <>
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex items-start gap-4">
                                            {selectedUser.profilePicture ? (
                                                <Image
                                                    src={selectedUser.profilePicture}
                                                    alt={selectedUser.name}
                                                    width={64}
                                                    height={64}
                                                    className="h-16 w-16 rounded-full object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-bold text-slate-700">
                                                    {selectedUser.name.slice(0, 1).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                                                <p className="mt-1 text-sm text-gray-500">{selectedUser.email}</p>
                                                <p className="mt-1 text-sm text-gray-500">{selectedUser.phone}</p>
                                                <p className="mt-2 text-sm text-gray-600">
                                                    {selectedUser.state || 'No state added'}{selectedUser.address ? ` | ${selectedUser.address}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDeleteUser}
                                            disabled={deletingUser}
                                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {deletingUser ? 'Deleting...' : 'Delete User'}
                                        </button>
                                    </div>

                                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Wallet</p>
                                            <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(selectedUser.walletBalance || 0)}</p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Transactions</p>
                                            <p className="mt-2 text-2xl font-bold text-gray-900">{selectedUser.transactionCount || 0}</p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Support Messages</p>
                                            <p className="mt-2 text-2xl font-bold text-gray-900">{selectedUser.supportMessageCount || 0}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {buildWhatsappLink(selectedUser.phone, selectedUser.name) ? (
                                            <a
                                                href={buildWhatsappLink(selectedUser.phone, selectedUser.name)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                            >
                                                Open WhatsApp
                                            </a>
                                        ) : null}
                                        {buildTelegramLink(selectedUser.telegramUsername) ? (
                                            <a
                                                href={buildTelegramLink(selectedUser.telegramUsername)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                                            >
                                                Open Telegram
                                            </a>
                                        ) : null}
                                        <a
                                            href={`mailto:${selectedUser.email}`}
                                            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Email User
                                        </a>
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {selectedUser ? (
                            <>
                                <div className="rounded-3xl bg-white p-6 shadow">
                                    <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-gray-500">
                                                    <th className="pb-3">Service</th>
                                                    <th className="pb-3">Amount</th>
                                                    <th className="pb-3">Status</th>
                                                    <th className="pb-3">Reference</th>
                                                    <th className="pb-3">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedTransactions.map((transaction) => (
                                                    <tr key={transaction.id} className="border-b border-gray-100">
                                                        <td className="py-3">{transaction.service}</td>
                                                        <td>{formatCurrency(transaction.amount)}</td>
                                                        <td>{transaction.status}</td>
                                                        <td className="text-gray-500">{transaction.reference || 'N/A'}</td>
                                                        <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {selectedTransactions.length === 0 ? (
                                            <div className="py-6 text-sm text-gray-500">No transactions recorded for this user yet.</div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-white p-6 shadow">
                                    <h3 className="text-lg font-semibold text-gray-900">Service Requests</h3>
                                    <div className="mt-4 space-y-4">
                                        {selectedRequests.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                                                No service requests yet.
                                            </div>
                                        ) : null}
                                        {selectedRequests.map((request) => (
                                            <article key={request.id} className="rounded-2xl border border-gray-100 p-4">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{request.category}</p>
                                                        <h4 className="mt-2 font-semibold text-gray-900">{request.title}</h4>
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            {request.provider || 'No provider'}{request.accountOrPhone ? ` | ${request.accountOrPhone}` : ''}
                                                        </p>
                                                        {request.note ? (
                                                            <p className="mt-3 text-sm leading-6 text-gray-600">{request.note}</p>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-left md:text-right">
                                                        <p className="font-semibold text-gray-900">{formatCurrency(request.amount || 0)}</p>
                                                        {request.expectedCredit ? (
                                                            <p className="mt-1 text-xs text-emerald-600">
                                                                Net credit: {formatCurrency(request.expectedCredit)}
                                                            </p>
                                                        ) : null}
                                                        <p className="mt-2 text-sm text-gray-500">{request.status}</p>
                                                        <p className="mt-1 text-xs text-gray-400">{new Date(request.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-white p-6 shadow">
                                    <h3 className="text-lg font-semibold text-gray-900">Live Support Chat</h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Gift card chats and support replies appear here in one thread.
                                    </p>
                                    <div className="mt-4 space-y-4">
                                        {selectedMessages.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                                                No support messages from this user.
                                            </div>
                                        ) : null}
                                        {selectedMessages.map((message) => (
                                            <article
                                                key={message.id}
                                                className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                                                    message.senderRole === 'user'
                                                        ? 'bg-slate-50 text-gray-900'
                                                        : 'ml-auto bg-blue-600 text-white'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                                                                message.senderRole === 'user' ? 'text-emerald-600' : 'text-blue-100'
                                                            }`}>
                                                                {message.senderRole === 'user' ? (message.senderName || 'User') : (message.senderName || 'Admin')}
                                                            </span>
                                                            <span className={`text-xs ${message.senderRole === 'user' ? 'text-gray-400' : 'text-blue-100'}`}>
                                                                {message.category}
                                                            </span>
                                                        </div>
                                                        <h4 className={`mt-2 font-semibold ${message.senderRole === 'user' ? 'text-gray-900' : 'text-white'}`}>
                                                            {message.subject}
                                                        </h4>
                                                        <p className={`mt-2 text-sm leading-6 ${message.senderRole === 'user' ? 'text-gray-600' : 'text-blue-50'}`}>
                                                            {message.message}
                                                        </p>
                                                        <div className={`mt-3 flex flex-wrap gap-3 text-xs ${
                                                            message.senderRole === 'user' ? 'text-gray-500' : 'text-blue-100'
                                                        }`}>
                                                            <span>{message.preferredChannel}</span>
                                                            <span>{message.contactHandle || 'No contact detail'}</span>
                                                            <span>{new Date(message.createdAt).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    {message.senderRole === 'user' ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {['Read', 'Contacted', 'Closed'].map((status) => (
                                                                <button
                                                                    key={status}
                                                                    type="button"
                                                                    onClick={() => handleMessageStatus(message.id, status)}
                                                                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                                                >
                                                                    Mark {status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    <form onSubmit={handleAdminReply} className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-slate-50 p-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Reply Category
                                                <select
                                                    value={replyForm.category}
                                                    onChange={(event) => setReplyForm((current) => ({ ...current, category: event.target.value }))}
                                                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value="Gift Card">Gift Card</option>
                                                    <option value="General">General</option>
                                                </select>
                                            </label>
                                            <label className="text-sm font-medium text-gray-700">
                                                Preferred Channel
                                                <select
                                                    value={replyForm.preferredChannel}
                                                    onChange={(event) => setReplyForm((current) => ({ ...current, preferredChannel: event.target.value }))}
                                                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value="Email">Email</option>
                                                    <option value="WhatsApp">WhatsApp</option>
                                                    <option value="Telegram">Telegram</option>
                                                    <option value="Phone">Phone</option>
                                                </select>
                                            </label>
                                        </div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Reply Message
                                            <textarea
                                                value={replyForm.message}
                                                onChange={(event) => setReplyForm((current) => ({ ...current, message: event.target.value }))}
                                                className="mt-2 min-h-[130px] w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                placeholder="Reply to the user here. The message will appear in their support chat."
                                                required
                                            />
                                        </label>
                                        <button
                                            type="submit"
                                            disabled={sendingReply}
                                            className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {sendingReply ? 'Sending...' : 'Send Reply'}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : null}
                    </div>

                    <div className="rounded-3xl bg-white p-5 shadow">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Unread Alerts</h2>
                                <p className="mt-1 text-sm text-gray-500">Recent support messages waiting for follow-up.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => refetchAdminMessages({ limit: 20 })}
                                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {adminMessagesLoading ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                                    Loading alerts...
                                </div>
                            ) : null}

                            {!adminMessagesLoading && adminMessages.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                                    No support alerts right now.
                                </div>
                            ) : null}

                            {adminMessages.map((message) => {
                                const whatsappLink = buildWhatsappLink(
                                    message.preferredChannel === 'WhatsApp' || message.preferredChannel === 'Phone'
                                        ? message.contactHandle || message.user?.phone
                                        : message.user?.phone,
                                    message.user?.name
                                );
                                const telegramLink = buildTelegramLink(
                                    message.preferredChannel === 'Telegram'
                                        ? message.contactHandle || message.user?.telegramUsername
                                        : message.user?.telegramUsername
                                );

                                return (
                                    <article key={message.id} className="rounded-2xl border border-gray-100 p-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUserId(message.user?.id || '')}
                                            className="text-left"
                                        >
                                            <p className="font-semibold text-gray-900">{message.subject}</p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {message.user?.name || 'Unknown user'} | {message.status}
                                            </p>
                                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                                                {message.category}
                                            </p>
                                        </button>
                                        <p className="mt-3 text-sm leading-6 text-gray-600">{message.message}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {whatsappLink ? (
                                                <a
                                                    href={whatsappLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                                >
                                                    WhatsApp
                                                </a>
                                            ) : null}
                                            {telegramLink ? (
                                                <a
                                                    href={telegramLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-sky-700"
                                                >
                                                    Telegram
                                                </a>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => handleMessageStatus(message.id, 'Contacted')}
                                                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Mark Contacted
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
