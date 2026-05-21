"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { FORGOT_PASSWORD_MUTATION, RESET_PASSWORD_WITH_OTP_MUTATION } from '@/lib/queries';
import AuthPageShell from '@/component/AuthPageShell';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState('request');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [forgotPassword, { loading: requestingOtp }] = useMutation(FORGOT_PASSWORD_MUTATION);
    const [resetPasswordWithOtp, { loading: resettingPassword }] = useMutation(RESET_PASSWORD_WITH_OTP_MUTATION);

    const handleChange = (event) => {
        setFormData((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
        setFeedback('');
        setError('');
    };

    const requestOtp = async () => {
        setFeedback('');
        setError('');

        try {
            const { data } = await forgotPassword({
                variables: {
                    email: formData.email,
                    phone: formData.phone,
                },
            });

            setFeedback(data.forgotPassword.message);
            setStep('reset');
        } catch (mutationError) {
            setError(mutationError.message);
        }
    };

    const resetPassword = async () => {
        setFeedback('');
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const { data } = await resetPasswordWithOtp({
                variables: {
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword,
                },
            });

            setFeedback(data.resetPasswordWithOtp.message);
            setTimeout(() => {
                router.push('/login');
            }, 1200);
        } catch (mutationError) {
            setError(mutationError.message);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (step === 'request') {
            await requestOtp();
            return;
        }

        await resetPassword();
    };

    const loading = requestingOtp || resettingPassword;

    return (
        <AuthPageShell
            badge="Password Recovery"
            title="Recover access without losing momentum."
            description="The reset flow now lives inside the same visual system as the rest of SM PAY, with clear steps for requesting an OTP and setting a new password."
            accentTitle="Recovery flow"
            accentBody="Users often hit this screen when trust is already fragile, so the design now feels calmer, clearer, and more connected to the wider app."
            highlights={[
                'Step-based recovery for request and reset states.',
                'Cleaner mobile layout for OTP entry and password updates.',
                'Direct path back into login once the password changes.',
            ]}
        >
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Forgot Password</h1>
                    <p className="mt-3 text-sm leading-7 text-[#9ab0c5]">
                        {step === 'request'
                            ? 'Enter the email and phone number tied to your account to receive a reset OTP.'
                            : 'Enter the OTP sent to your email address and choose a new password.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="block text-sm font-medium text-[#dce6f0]">
                        Email
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="field-dark mt-2"
                            required
                        />
                    </label>

                    {step === 'request' ? (
                        <label className="block text-sm font-medium text-[#dce6f0]">
                            Registered Phone Number
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="field-dark mt-2"
                                required
                            />
                        </label>
                    ) : (
                        <>
                            <label className="block text-sm font-medium text-[#dce6f0]">
                                6-Digit OTP
                                <input
                                    name="otp"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={formData.otp}
                                    onChange={handleChange}
                                    className="field-dark mt-2"
                                    required
                                />
                            </label>

                            <div className="relative">
                                <label className="block text-sm font-medium text-[#dce6f0]">
                                    New Password
                                    <input
                                        name="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="field-dark mt-2 pr-12"
                                        required
                                    />
                                </label>
                                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute bottom-4 right-4 text-[#8aa0b7]">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-[#dce6f0]">
                                    Confirm New Password
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="field-dark mt-2 pr-12"
                                        required
                                    />
                                </label>
                                <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="absolute bottom-4 right-4 text-[#8aa0b7]">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </>
                    )}

                    {feedback ? (
                        <div className="rounded-2xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                            {feedback}
                        </div>
                    ) : null}
                    {error ? (
                        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    ) : null}

                    <button type="submit" disabled={loading} className="button-primary w-full px-5 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                        {loading
                            ? step === 'request'
                                ? 'Sending OTP...'
                                : 'Updating Password...'
                            : step === 'request'
                                ? 'Send OTP'
                                : 'Reset Password'}
                    </button>
                </form>

                {step === 'reset' ? (
                    <button
                        type="button"
                        onClick={() => {
                            setStep('request');
                            setFeedback('');
                            setError('');
                            setFormData((current) => ({
                                ...current,
                                otp: '',
                                newPassword: '',
                                confirmPassword: '',
                            }));
                        }}
                        className="text-sm font-medium text-[#7df2c8] transition hover:text-white"
                    >
                        Use a different email or phone number
                    </button>
                ) : null}

                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm text-[#9ab0c5]">
                    Remembered it?{' '}
                    <Link href="/login" className="font-semibold text-[#7df2c8] transition hover:text-white">
                        Back to login
                    </Link>
                </div>
            </div>
        </AuthPageShell>
    );
}
