"use client";

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LOGIN_MUTATION } from '../../lib/queries';
import { Eye, EyeOff } from "lucide-react";
import { storeAuthSession } from '@/utils/auth';
import AuthPageShell from '@/component/AuthPageShell';

export default function LoginPage() {
    const router = useRouter();
    const [showpassword, setshowpassword] = useState(false)
    const [login, { loading }] = useMutation(LOGIN_MUTATION);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill all fields');
            return;
        }

        try {
            const { data } = await login({
                variables: {
                    email: formData.email,
                    password: formData.password,
                },
            });

            if (data.login.token) {
                storeAuthSession(data.login.token);
                const defaultRedirect = data.login.user?.role === 'admin' ? '/admin' : '/dashboard';
                const redirectTo = new URLSearchParams(window.location.search).get('redirect') || defaultRedirect;
                router.push(redirectTo);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AuthPageShell
            badge="User Login"
            title="Welcome back to SM PAY."
            description="Sign in to fund your wallet, launch services, follow transactions, and keep support conversations in one place."
            accentTitle="Why this screen matters"
            accentBody="This is the front door for repeat actions, so the login experience now matches the premium direction of the landing page instead of feeling like a disconnected utility form."
            highlights={[
                'Fast access to wallet funding, airtime, and data flows.',
                'A smoother visual handoff from the landing page into the app.',
                'Responsive layout that stays usable on phones and larger screens.',
            ]}
        >
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Sign in</h2>
                    <p className="mt-3 text-sm leading-7 text-[#9ab0c5]">
                        Use your SM PAY email and password to continue.
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error ? (
                        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    ) : null}
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#dce6f0]">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="field-dark"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="relative w-full">
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#dce6f0]">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type={showpassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="field-dark pr-12"
                            placeholder="Enter password"
                        />
                        <button
                            type="button"
                            onClick={() => setshowpassword(!showpassword)}
                            className="absolute bottom-4 right-4 text-[#8aa0b7]"
                        >
                            {showpassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button type="submit" disabled={loading} className="button-primary w-full px-5 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <div className="text-right">
                        <Link href="/forgot-password" className="text-sm font-semibold text-[#7df2c8] transition hover:text-white">
                            Forgot password?
                        </Link>
                    </div>
                </form>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm text-[#9ab0c5]">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-semibold text-[#7df2c8] transition hover:text-white">
                        Sign up
                    </Link>
                </div>
            </div>
        </AuthPageShell>
    );
}
