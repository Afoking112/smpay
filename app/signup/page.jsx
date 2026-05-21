"use client";
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SIGNUP_MUTATION } from '../../lib/queries';
import { Eye, EyeOff } from "lucide-react";
import { storeAuthSession } from '@/utils/auth';
import AuthPageShell from '@/component/AuthPageShell';
export default function SignupPage() {
    const router = useRouter();
    const [signup, { loading }] = useMutation(SIGNUP_MUTATION);
    const [error, setError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            const { data } = await signup({
                variables: {
                    input: {
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        password: formData.password,
                    },
                },
            });

            if (data.signup.token) {
                storeAuthSession(data.signup.token);
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AuthPageShell
            badge="User Signup"
            title="Create your SM PAY account."
            description="Open your wallet, launch airtime and data purchases, track requests, and keep your payment activity inside one responsive dashboard."
            accentTitle="What you unlock"
            accentBody="The refreshed user flow is designed so the signup page, dashboard, profile, and support area all feel like one system instead of separate tools."
            highlights={[
                'Account creation that now matches the 3D public experience.',
                'Responsive layout for mobile onboarding and desktop setup.',
                'A direct handoff into the user dashboard once signup succeeds.',
            ]}
        >
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Sign up</h2>
                    <p className="mt-3 text-sm leading-7 text-[#9ab0c5]">
                        Create your account and move straight into the SM PAY user experience.
                    </p>
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error ? (
                        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    ) : null}
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="text-sm font-medium text-[#dce6f0]">
                            Full Name
                            <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="field-dark mt-2" placeholder="Enter your name" />
                        </label>
                        <label className="text-sm font-medium text-[#dce6f0]">
                            Phone Number
                            <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="field-dark mt-2" placeholder="08012345678" />
                        </label>
                    </div>
                    <label className="block text-sm font-medium text-[#dce6f0]">
                        Email
                        <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="field-dark mt-2" placeholder="Enter your email" />
                    </label>
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-[#dce6f0]">
                                Password
                            </label>
                            <input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className="field-dark mt-2 pr-12" placeholder="Enter password" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute bottom-4 right-4 text-[#8aa0b7]">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#dce6f0]">
                                Confirm Password
                            </label>
                            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange} className="field-dark mt-2 pr-12" placeholder="Confirm your password" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute bottom-4 right-4 text-[#8aa0b7]">
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="button-primary w-full px-5 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm text-[#9ab0c5]">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-[#7df2c8] transition hover:text-white">
                        Log in
                    </Link>
                </div>
            </div>
        </AuthPageShell>
    );
}
