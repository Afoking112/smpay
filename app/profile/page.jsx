"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import UserShell from '@/component/UserShell';
import { ME_QUERY, UPDATE_PROFILE_MUTATION } from '@/lib/queries';
import useSessionUser from '@/utils/useSessionUser';

function ProfileLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="rounded-2xl bg-white px-8 py-6 text-center shadow">
                <p className="text-lg font-semibold text-gray-900">Loading your profile...</p>
            </div>
        </div>
    );
}

function ProfileEditor({ user }) {
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: user.name || '',
        phone: user.phone || '',
        state: user.state || '',
        address: user.address || '',
        telegramUsername: user.telegramUsername || '',
        profilePicture: user.profilePicture || '',
    });
    const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE_MUTATION, {
        refetchQueries: [{ query: ME_QUERY }],
        awaitRefetchQueries: true,
    });

    const handleChange = (event) => {
        setFormData((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
        setFeedback('');
        setError('');
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (file.size > 1024 * 1024) {
            setError('Please upload an image smaller than 1MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFormData((current) => ({
                ...current,
                profilePicture: String(reader.result || ''),
            }));
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFeedback('');
        setError('');

        try {
            const { data } = await updateProfile({
                variables: {
                    input: formData,
                },
            });

            setFeedback(data.updateProfile.message);
        } catch (mutationError) {
            setError(mutationError.message);
        }
    };

    return (
        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-3xl bg-white p-6 shadow">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Preview</p>
                <div className="mt-5 flex flex-col items-center text-center">
                    {formData.profilePicture ? (
                        <Image
                            src={formData.profilePicture}
                            alt={formData.name || user.name}
                            width={112}
                            height={112}
                            className="h-28 w-28 rounded-full object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50 text-3xl font-bold text-blue-700">
                            {(formData.name || user.name || 'U').slice(0, 1).toUpperCase()}
                        </div>
                    )}
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">{formData.name || user.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">{formData.phone || user.phone}</p>
                    <p className="mt-3 text-sm text-gray-600">
                        {formData.state || 'State not added yet'}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        {formData.address || 'Address not added yet'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow">
                <div className="grid gap-5 md:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                        Full Name
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            required
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Phone Number
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            required
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        State
                        <input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Lagos"
                            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Telegram Username
                        <input
                            name="telegramUsername"
                            value={formData.telegramUsername}
                            onChange={handleChange}
                            placeholder="@yourhandle"
                            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700 md:col-span-2">
                        Address
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your full address"
                            className="mt-2 min-h-[120px] w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </label>
                    <div className="text-sm font-medium text-gray-700 md:col-span-2">
                        Profile Picture
                        <div className="mt-2 rounded-2xl border border-dashed border-gray-300 p-4">
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            <p className="mt-2 text-xs text-gray-500">
                                Upload a clear image under 1MB. It will be shown in your dashboard and admin view.
                            </p>
                            {formData.profilePicture ? (
                                <button
                                    type="button"
                                    onClick={() => setFormData((current) => ({ ...current, profilePicture: '' }))}
                                    className="mt-3 rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                                >
                                    Remove picture
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {feedback ? (
                    <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {feedback}
                    </div>
                ) : null}
                {error ? (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <p className="text-sm text-gray-500">
                        Keeping this updated helps support respond faster on WhatsApp or Telegram.
                    </p>
                </div>
            </form>
        </section>
    );
}

export default function ProfilePage() {
    const { hasToken, loading, error: sessionError, user } = useSessionUser({
        redirectTo: '/login?redirect=/profile',
        requiredRole: 'user',
    });

    if (!hasToken || loading) {
        return <ProfileLoading />;
    }

    if (sessionError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="rounded-2xl bg-white p-8 shadow">
                    <p className="text-lg font-semibold text-gray-900">We could not load your profile.</p>
                    <p className="mt-2 text-sm text-gray-500">{sessionError.message}</p>
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
            title="Profile Update"
            description="Add the details the admin team needs to verify you faster, including your picture, phone number, state, address, and Telegram username."
        >
            <ProfileEditor key={user.id} user={user} />
        </UserShell>
    );
}
