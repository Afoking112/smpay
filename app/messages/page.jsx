"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import UserShell from '@/component/UserShell';
import {
    ME_QUERY,
    SEND_SUPPORT_MESSAGE_MUTATION,
    SUPPORT_MESSAGES_QUERY,
} from '@/lib/queries';
import useSessionUser from '@/utils/useSessionUser';

const channelOptions = ['WhatsApp', 'Telegram', 'Phone', 'Email'];
const categoryOptions = ['General', 'Gift Card'];

function MessagesLoading() {
    return (
        <div className="app-shell-bg app-shell-grid flex min-h-screen items-center justify-center px-4">
            <div className="app-card rounded-[2rem] px-8 py-6 text-center text-white">
                <p className="text-lg font-semibold">Loading your support chat...</p>
            </div>
        </div>
    );
}

function MessagesContent({ user }) {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'General',
        message: '',
        preferredChannel: 'WhatsApp',
        contactHandle: user.phone || '',
    });
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const { data, loading: messagesLoading } = useQuery(SUPPORT_MESSAGES_QUERY, {
        variables: { limit: 50 },
        pollInterval: 5000,
        fetchPolicy: 'cache-and-network',
    });
    const [sendSupportMessage, { loading: sending }] = useMutation(SEND_SUPPORT_MESSAGE_MUTATION, {
        refetchQueries: [{ query: SUPPORT_MESSAGES_QUERY, variables: { limit: 50 } }, { query: ME_QUERY }],
        awaitRefetchQueries: true,
    });
    const messages = useMemo(() => data?.supportMessages ?? [], [data]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
        setFeedback('');
        setError('');
    };

    const handleChannelChange = (event) => {
        const nextChannel = event.target.value;

        setFormData((current) => ({
            ...current,
            preferredChannel: nextChannel,
            contactHandle:
                nextChannel === 'Telegram'
                    ? user.telegramUsername || ''
                    : nextChannel === 'Email'
                        ? user.email || ''
                        : user.phone || '',
        }));
        setFeedback('');
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFeedback('');
        setError('');

        try {
            const { data: mutationData } = await sendSupportMessage({
                variables: {
                    input: formData,
                },
            });

            setFeedback(mutationData.sendSupportMessage.message);
            setFormData((current) => ({
                ...current,
                subject: '',
                message: '',
            }));
        } catch (mutationError) {
            setError(mutationError.message);
        }
    };

    return (
        <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="app-card rounded-[1.75rem] p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Send support message</h2>
                        <p className="mt-2 text-sm text-[#8ea4ba]">
                            Start a normal support request or a gift card chat from here.
                        </p>
                    </div>
                    <div className="rounded-full bg-[#00d5ff]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00d5ff]">
                        Live Updates
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="block text-sm font-medium text-[#dce6f0]">
                        Category
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="app-input mt-2"
                        >
                            {categoryOptions.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block text-sm font-medium text-[#dce6f0]">
                        Subject
                        <input
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder={formData.category === 'Gift Card' ? 'Gift card sale request' : 'General support request'}
                            className="app-input mt-2"
                            required
                        />
                    </label>

                    <label className="block text-sm font-medium text-[#dce6f0]">
                        Preferred Channel
                        <select
                            value={formData.preferredChannel}
                            onChange={handleChannelChange}
                            className="app-input mt-2"
                        >
                            {channelOptions.map((channel) => (
                                <option key={channel} value={channel}>
                                    {channel}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block text-sm font-medium text-[#dce6f0]">
                        Contact Detail
                        <input
                            name="contactHandle"
                            value={formData.contactHandle}
                            onChange={handleChange}
                            placeholder={formData.preferredChannel === 'Telegram' ? '@username' : '08012345678'}
                            className="app-input mt-2"
                        />
                    </label>

                    <label className="block text-sm font-medium text-[#dce6f0]">
                        Message
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder={formData.category === 'Gift Card'
                                ? 'Tell the admin what gift card you want to sell.'
                                : 'Explain the issue you want the admin to review.'}
                            className="app-input mt-2 min-h-[180px]"
                            required
                        />
                    </label>

                    {feedback ? (
                        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {feedback}
                        </div>
                    ) : null}
                    {error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={sending}
                        className="button-primary w-full px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {sending ? 'Sending...' : 'Send to Support'}
                    </button>
                </form>
            </div>

            <div className="app-card rounded-[1.75rem] p-6 text-white">
                <h2 className="text-xl font-semibold text-white">Support conversation</h2>
                <p className="mt-2 text-sm text-[#8ea4ba]">
                    This updates automatically when an admin replies.
                </p>

                <div className="mt-5 space-y-4">
                    {messagesLoading ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-[#8ea4ba]">
                            Loading support chat...
                        </div>
                    ) : null}

                    {!messagesLoading && messages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-[#8ea4ba]">
                            No support messages yet. Your first message will appear here.
                        </div>
                    ) : null}

                    {messages.map((messageItem) => {
                        const isUserMessage = messageItem.senderRole === 'user';

                        return (
                            <article
                                key={messageItem.id}
                                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                                    isUserMessage
                                        ? 'ml-auto bg-[#00d5ff]/18 text-white'
                                        : 'app-subcard text-white'
                                }`}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                                        isUserMessage ? 'text-[#c8f9ea]' : 'text-[#7df2c8]'
                                    }`}>
                                        {isUserMessage ? 'You' : messageItem.senderName || 'Admin'}
                                    </span>
                                    <span className={`text-xs ${isUserMessage ? 'text-[#c8f9ea]' : 'text-[#8ea4ba]'}`}>
                                        {messageItem.category}
                                    </span>
                                </div>
                                <h3 className="mt-2 font-semibold text-white">
                                    {messageItem.subject}
                                </h3>
                                <p className={`mt-2 text-sm leading-6 ${isUserMessage ? 'text-[#e7f9ff]' : 'text-[#b7c6d7]'}`}>
                                    {messageItem.message}
                                </p>
                                <div className={`mt-3 flex flex-wrap gap-3 text-xs ${isUserMessage ? 'text-[#c8f9ea]' : 'text-[#8ea4ba]'}`}>
                                    <span>{messageItem.preferredChannel}</span>
                                    <span>{messageItem.contactHandle || 'No contact detail'}</span>
                                    <span>{new Date(messageItem.createdAt).toLocaleString()}</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default function MessagesPage() {
    const { hasToken, loading, error: sessionError, user } = useSessionUser({
        redirectTo: '/login?redirect=/messages',
        requiredRole: 'user',
    });

    if (!hasToken || loading) {
        return <MessagesLoading />;
    }

    if (sessionError) {
        return (
            <div className="app-shell-bg app-shell-grid flex min-h-screen items-center justify-center px-4">
                <div className="app-card rounded-[2rem] p-8 text-white">
                    <p className="text-lg font-semibold text-white">We could not load your support chat.</p>
                    <p className="mt-2 text-sm text-[#8ea4ba]">{sessionError.message}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <UserShell
            user={user}
            title="Support"
            description="Message the admin team here and keep watching this page for replies. Gift card chats and general support updates will appear in one place."
        >
            <MessagesContent key={user.id} user={user} />
        </UserShell>
    );
}
