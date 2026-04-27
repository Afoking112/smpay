"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { FORGOT_PASSWORD_MUTATION } from '@/lib/queries';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);

    const handleChange = (event) => {
        setFormData((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
        setFeedback('');
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFeedback('');
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const { data } = await forgotPassword({
                variables: {
                    email: formData.email,
                    phone: formData.phone,
                    newPassword: formData.newPassword,
                },
            });

            setFeedback(data.forgotPassword.message);
            setTimeout(() => {
                router.push('/login');
            }, 1200);
        } catch (mutationError) {
            setError(mutationError.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100 px-4 py-12">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_24px_60px_rgba(37,99,235,0.12)]">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="mt-3 text-sm text-gray-600">
                        Recover your account with the email and phone number you used when signing up.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block text-sm font-medium text-gray-700">
                        Email
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            required
                        />
                    </label>

                    <label className="block text-sm font-medium text-gray-700">
                        Registered Phone Number
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            required
                        />
                    </label>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">
                            New Password
                            <input
                                name="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute bottom-3 right-4 text-gray-500"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((current) => !current)}
                            className="absolute bottom-3 right-4 text-gray-500"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

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
                        disabled={loading}
                        className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Updating Password...' : 'Reset Password'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Remembered it?{' '}
                    <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
}
