"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
    ME_QUERY,
    SEND_SUPPORT_MESSAGE_MUTATION,
    SUPPORT_MESSAGES_QUERY,
} from '@/lib/queries';

const channelOptions = ['WhatsApp', 'Telegram', 'Phone', 'Email'];

export default function GiftCardChatPanel() {
    const { data: meData } = useQuery(ME_QUERY, {
        fetchPolicy: 'cache-first',
    });
    const user = meData?.me;
    const [formData, setFormData] = useState({
        message: '',
        preferredChannel: 'WhatsApp',
        contactHandle: user?.phone || '',
    });
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const { data, loading } = useQuery(SUPPORT_MESSAGES_QUERY, {
        variables: {
            limit: 50,
            category: 'Gift Card',
        },
        pollInterval: 5000,
        fetchPolicy: 'cache-and-network',
    });
    const [sendSupportMessage, { loading: sending }] = useMutation(SEND_SUPPORT_MESSAGE_MUTATION, {
        refetchQueries: [
            { query: SUPPORT_MESSAGES_QUERY, variables: { limit: 50, category: 'Gift Card' } },
            { query: SUPPORT_MESSAGES_QUERY, variables: { limit: 50 } },
        ],
        awaitRefetchQueries: true,
    });

    const messages = useMemo(() => data?.supportMessages ?? [], [data]);

    const handleChannelChange = (event) => {
        const nextChannel = event.target.value;

        setFormData((current) => ({
            ...current,
            preferredChannel: nextChannel,
            contactHandle:
                nextChannel === 'Telegram'
                    ? user?.telegramUsername || ''
                    : nextChannel === 'Email'
                        ? user?.email || ''
                        : user?.phone || '',
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
                    input: {
                        subject: 'Gift card sale request',
                        category: 'Gift Card',
                        message: formData.message,
                        preferredChannel: formData.preferredChannel,
                        contactHandle: formData.contactHandle,
                    },
                },
            });

            setFeedback(mutationData.sendSupportMessage.message);
            setFormData((current) => ({
                ...current,
                message: '',
            }));
        } catch (mutationError) {
            setError(mutationError.message);
        }
    };

    return (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-3xl border border-gray-100 bg-slate-50 p-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="font-semibold">Gift card live chat</p>
                    <p className="mt-2">
                        Tell us the card you want to sell and hold on until the admin is online. The admin dashboard will be alerted and an email notification will also be triggered for gift card chats.
                    </p>
                </div>

                <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-500">
                            Loading chat...
                        </div>
                    ) : null}

                    {!loading && messages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-500">
                            Start the chat with your gift card details. Admin replies will appear here automatically.
                        </div>
                    ) : null}

                    {messages.map((message) => {
                        const isUserMessage = message.senderRole === 'user';

                        return (
                            <article
                                key={message.id}
                                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                                    isUserMessage
                                        ? 'ml-auto bg-blue-600 text-white'
                                        : 'bg-white text-gray-900'
                                }`}
                            >
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                                    isUserMessage ? 'text-blue-100' : 'text-emerald-600'
                                }`}>
                                    {isUserMessage ? 'You' : message.senderName || 'Admin'}
                                </p>
                                <p className={`mt-2 text-sm leading-6 ${isUserMessage ? 'text-blue-50' : 'text-gray-600'}`}>
                                    {message.message}
                                </p>
                                <div className={`mt-3 flex flex-wrap gap-2 text-xs ${isUserMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                    <span>{message.preferredChannel}</span>
                                    <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow">
                <h3 className="text-lg font-semibold text-gray-900">Send to admin</h3>
                <p className="mt-2 text-sm text-gray-500">
                    Add your preferred contact method so the admin can continue the sale with you.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Preferred Channel
                        <select
                            value={formData.preferredChannel}
                            onChange={handleChannelChange}
                            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {channelOptions.map((channel) => (
                                <option key={channel} value={channel}>
                                    {channel}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                        Contact Detail
                        <input
                            value={formData.contactHandle}
                            onChange={(event) => setFormData((current) => ({ ...current, contactHandle: event.target.value }))}
                            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder={formData.preferredChannel === 'Telegram' ? '@username' : '08012345678'}
                        />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                        Gift Card Message
                        <textarea
                            value={formData.message}
                            onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
                            className="mt-2 min-h-[180px] w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Example: I want to sell a 100 USD Apple gift card. Please tell me the current rate."
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
                        className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {sending ? 'Sending...' : 'Start Gift Card Chat'}
                    </button>
                </form>
            </div>
        </div>
    );
}
