"use client";

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/component/Navbar';
import Footer from '@/component/Footer';

export default function StatusPage() {
    const [state, setState] = useState({
        loading: true,
        error: '',
        data: null,
    });

    const loadHealth = useCallback(async () => {
        try {
            const response = await fetch('/api/health', { cache: 'no-store' });
            const data = await response.json();

            setState({
                loading: false,
                error: '',
                data,
            });
        } catch (error) {
            setState({
                loading: false,
                error: error instanceof Error ? error.message : 'Could not load health status',
                data: null,
            });
        }
    }, []);

    useEffect(() => {
        const run = async () => {
            await loadHealth();
        };

        run();
    }, [loadHealth]);

    const data = state.data;
    const envChecks = data?.checks?.env ? Object.entries(data.checks.env) : [];

    return (
        <main className="public-aurora public-grid min-h-screen text-white">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7df2c8]">
                            System Status
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            Operational checks for SM PAY
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-[#b7c6d7]">
                            This page reads the health endpoint and shows whether critical environment variables are set and whether the current database connection succeeds.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setState((current) => ({ ...current, loading: true, error: '' }));
                            loadHealth();
                        }}
                        className="button-primary px-5 py-3 text-sm"
                    >
                        Refresh Status
                    </button>
                </div>

                {state.loading ? (
                    <div className="app-card mt-10 rounded-[2rem] p-8 text-[#b7c6d7]">
                        <p>Checking current health status...</p>
                    </div>
                ) : null}

                {state.error ? (
                    <div className="mt-10 rounded-[2rem] border border-red-400/30 bg-red-500/10 p-8 text-red-200 shadow">
                        {state.error}
                    </div>
                ) : null}

                {data ? (
                    <>
                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            <div className="app-card rounded-[2rem] p-6">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#00d5ff]">Overall</p>
                                <p className={`mt-4 text-3xl font-bold ${data.ok ? 'text-green-600' : 'text-red-500'}`}>
                                    {data.ok ? 'Healthy' : 'Attention Needed'}
                                </p>
                            </div>
                            <div className="app-card rounded-[2rem] p-6">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7df2c8]">Database</p>
                                <p className={`mt-4 text-3xl font-bold ${data.checks.db.ok ? 'text-green-600' : 'text-red-500'}`}>
                                    {data.checks.db.ok ? 'Connected' : 'Unavailable'}
                                </p>
                            </div>
                            <div className="app-card rounded-[2rem] p-6">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffb347]">Checked At</p>
                                <p className="mt-4 text-lg font-semibold text-white">
                                    {new Date(data.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                            <section className="app-card rounded-[2rem] p-8">
                                <h2 className="text-2xl font-semibold text-white">Environment checks</h2>
                                <div className="mt-6 grid gap-4">
                                    {envChecks.map(([key, value]) => (
                                        <div key={key} className="app-subcard flex items-center justify-between rounded-2xl px-4 py-4">
                                            <span className="font-medium text-[#dce6f0]">{key}</span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {value ? 'Configured' : 'Missing'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="app-card rounded-[2rem] p-8">
                                <h2 className="text-2xl font-semibold text-white">Database message</h2>
                                <div className={`mt-6 rounded-2xl p-5 ${
                                    data.checks.db.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                                }`}>
                                    {data.checks.db.message}
                                </div>
                                {!data.checks.db.ok ? (
                                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                                        If the app now fails after the SRV lookup stage, the most likely remaining Atlas issue is IP access. Add this machine&apos;s current IP to the Atlas network access list and retry.
                                    </div>
                                ) : null}
                            </section>
                        </div>
                    </>
                ) : null}
            </div>
            <Footer />
        </main>
    );
}
