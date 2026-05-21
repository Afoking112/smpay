"use client"

import { useMutation } from "@apollo/client/react"
import { useState } from "react"
import { useRouter } from 'next/navigation';
import { ADMIN_SIGNUP } from "../../lib/queries"
import { storeAuthSession } from '@/utils/auth';
import { Eye, EyeOff } from "lucide-react";
import AuthPageShell from '@/component/AuthPageShell';

export default function AdminSignup() {
    const router = useRouter();
    const [signup, { loading }] = useMutation(ADMIN_SIGNUP)
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: ""
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        setError('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const { data } = await signup({
                variables: {
                    input: formData
                }
            })
            if (data.adminSignup.token) {
                storeAuthSession(data.adminSignup.token);
                router.push('/admin');
            }
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <AuthPageShell
            badge="Admin Signup"
            title="Create a new SM PAY admin account."
            description="Set up admin access for monitoring support, users, tracked requests, and the operational side of the platform."
            accentTitle="Admin role"
            accentBody="This signup experience now matches the rest of the refreshed UI, while keeping the content clear that this route is for operational access."
            highlights={[
                'Responsive admin onboarding for desktop and mobile.',
                'Consistent 3D shell across admin authentication routes.',
                'Direct redirect into the admin monitor after signup.',
            ]}
        >
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-semibold text-white sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Create admin account</h2>
                    <p className="mt-3 text-sm leading-7 text-[#9ab0c5]">
                        Register a new operator account for the SM PAY admin workspace.
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
                            <input name="name" type="text" required value={formData.name} onChange={handleChange} className="field-dark mt-2" placeholder="Enter full name" />
                        </label>
                        <label className="text-sm font-medium text-[#dce6f0]">
                            Phone
                            <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="field-dark mt-2" placeholder="08012345678" />
                        </label>
                    </div>
                    <label className="block text-sm font-medium text-[#dce6f0]">
                        Email
                        <input name="email" type="email" required value={formData.email} onChange={handleChange} className="field-dark mt-2" placeholder="admin@example.com" />
                    </label>
                    <div className="relative">
                        <label className="block text-sm font-medium text-[#dce6f0]">
                            Password
                            <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className="field-dark mt-2 pr-12" placeholder="Min 6 characters" />
                        </label>
                        <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute bottom-4 right-4 text-[#8aa0b7]">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button type="submit" disabled={loading} className="button-primary w-full px-5 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                        {loading ? 'Creating...' : 'Create Admin Account'}
                    </button>
                </form>
            </div>
        </AuthPageShell>
    )
}

