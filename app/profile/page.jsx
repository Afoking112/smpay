"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import UserShell from '@/component/UserShell';
import { ME_QUERY, UPDATE_PROFILE_MUTATION } from '@/lib/queries';
import useSessionUser from '@/utils/useSessionUser';

function ProfileLoading() {
    return (
        <div className="app-shell-bg app-shell-grid flex min-h-screen items-center justify-center px-4">
            <div className="app-card rounded-[2rem] px-8 py-6 text-center text-white">
                <p className="text-lg font-semibold">Loading your profile...</p>
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
            <div className="app-card rounded-[1.75rem] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00d5ff]">Preview</p>
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
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/[0.06] text-3xl font-bold text-[#7df2c8]">
                            {(formData.name || user.name || 'U').slice(0, 1).toUpperCase()}
                        </div>
                    )}
                    <h2 className="mt-4 text-xl font-semibold text-white">{formData.name || user.name}</h2>
                    <p className="mt-1 text-sm text-[#8ea4ba]">{formData.phone || user.phone}</p>
                    <p className="mt-3 text-sm text-[#b7c6d7]">
                        {formData.state || 'State not added yet'}
                    </p>
                    <p className="mt-2 text-sm text-[#8ea4ba]">
                        {formData.address || 'Address not added yet'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="app-card rounded-[1.75rem] p-6">
                <div className="grid gap-5 md:grid-cols-2">
                    <label className="text-sm font-medium text-[#dce6f0]">
                        Full Name
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="field-dark mt-2"
                            required
                        />
                    </label>
                    <label className="text-sm font-medium text-[#dce6f0]">
                        Phone Number
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="field-dark mt-2"
                            required
                        />
                    </label>
                    <label className="text-sm font-medium text-[#dce6f0]">
                        State
                        <input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Lagos"
                            className="field-dark mt-2"
                        />
                    </label>
                    <label className="text-sm font-medium text-[#dce6f0]">
                        Telegram Username
                        <input
                            name="telegramUsername"
                            value={formData.telegramUsername}
                            onChange={handleChange}
                            placeholder="@yourhandle"
                            className="field-dark mt-2"
                        />
                    </label>
                    <label className="text-sm font-medium text-[#dce6f0] md:col-span-2">
                        Address
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your full address"
                            className="field-dark mt-2 min-h-[120px]"
                        />
                    </label>
                    <div className="text-sm font-medium text-[#dce6f0] md:col-span-2">
                        Profile Picture
                        <div className="mt-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4">
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            <p className="mt-2 text-xs text-[#8ea4ba]">
                                Upload a clear image under 1MB. It will be shown in your dashboard and admin view.
                            </p>
                            {formData.profilePicture ? (
                                <button
                                    type="button"
                                    onClick={() => setFormData((current) => ({ ...current, profilePicture: '' }))}
                                    className="button-secondary mt-3 px-3 py-1 text-xs"
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
                        className="button-primary px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <p className="text-sm text-[#8ea4ba]">
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
            <div className="app-shell-bg app-shell-grid flex min-h-screen items-center justify-center px-4">
                <div className="app-card rounded-[2rem] p-8 text-white">
                    <p className="text-lg font-semibold text-white">We could not load your profile.</p>
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
            title="Profile Update"
            description="Add the details the admin team needs to verify you faster, including your picture, phone number, state, address, and Telegram username."
        >
            <ProfileEditor key={user.id} user={user} />
        </UserShell>
    );
}
