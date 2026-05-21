"use client"

import { useMutation } from "@apollo/client/react"
import { useState } from "react"
import { useRouter } from 'next/navigation';
import { ADMIN_LOGIN } from "../../lib/queries"
import Link from 'next/link';
import { storeAuthSession } from '@/utils/auth';
import { Eye, EyeOff } from "lucide-react";
import AuthPageShell from '@/component/AuthPageShell';


export default function AdminLogin() {
    const router = useRouter();
    const [adlogin, { loading }] = useMutation(ADMIN_LOGIN)
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const handleChange = (param) => {
        setFormData({
            ...formData,
            [param.target.name]: param.target.value,
        })
        setError('');
    }

    const handleSubmit = async (param) => {
        param.preventDefault();
        setError('');
        if (!formData.email || !formData.password) {
            setError('Please Fill all fields');
            return;
        }
        try {
            const { data } = await adlogin({
                variables: {
                    email: formData.email,
                    password: formData.password
                }
            })
            if (data.adminLogin.token) {
                storeAuthSession(data.adminLogin.token);
                router.push('/admin');
            }
        } catch (err) {
            setError(err.message);
        }

    }
    return (
        <AuthPageShell
            badge="Admin Login"
            title="Enter the SM PAY admin monitor."
            description="Sign in to review user activity, support threads, tracked requests, and operational alerts from the upgraded admin workspace."
            accentTitle="Admin access"
            accentBody="This route now uses the same premium design system as the user-facing experience, while keeping a clear operational tone for back-office tasks."
            highlights={[
                'Responsive access to admin support and user-monitoring tools.',
                'A stronger visual distinction between public marketing and operations.',
                'Faster route into the admin monitor after authentication.',
            ]}
        >
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Admin sign in</h2>
                    <p className="mt-3 text-sm leading-7 text-[#9ab0c5]">
                        Use your admin email and password to access the monitor.
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
                        <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="field-dark" placeholder="Enter your email" />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#dce6f0]">
                            Password
                        </label>
                        <input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className="field-dark pr-12" placeholder="Enter password" />
                        <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute bottom-4 right-4 text-[#8aa0b7]">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
            </div>
        </AuthPageShell>
    )

}
