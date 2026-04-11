"use client";

import { useCallback, useEffect, useState } from 'react';

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
        <main className="min-h-screen bg-slate-50 px-6 py-16 md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                            System Status
                        </p>
                        <h1 className="mt-4 text-4xl font-bold text-gray-900">
                            Operational checks for SM Pay
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-gray-600">
                            This page reads the health endpoint and shows whether critical environment variables are set and whether the current database connection succeeds.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setState((current) => ({ ...current, loading: true, error: '' }));
                            loadHealth();
                        }}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Refresh Status
                    </button>
                </div>

                {state.loading ? (
                    <div className="mt-10 rounded-3xl bg-white p-8 shadow">
                        <p className="text-gray-600">Checking current health status...</p>
                    </div>
                ) : null}

                {state.error ? (
                    <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-600 shadow">
                        {state.error}
                    </div>
                ) : null}

                {data ? (
                    <>
                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            <div className="rounded-3xl bg-white p-6 shadow">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Overall</p>
                                <p className={`mt-4 text-3xl font-bold ${data.ok ? 'text-green-600' : 'text-red-500'}`}>
                                    {data.ok ? 'Healthy' : 'Attention Needed'}
                                </p>
                            </div>
                            <div className="rounded-3xl bg-white p-6 shadow">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Database</p>
                                <p className={`mt-4 text-3xl font-bold ${data.checks.db.ok ? 'text-green-600' : 'text-red-500'}`}>
                                    {data.checks.db.ok ? 'Connected' : 'Unavailable'}
                                </p>
                            </div>
                            <div className="rounded-3xl bg-white p-6 shadow">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Checked At</p>
                                <p className="mt-4 text-lg font-semibold text-gray-900">
                                    {new Date(data.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                            <section className="rounded-3xl bg-white p-8 shadow">
                                <h2 className="text-2xl font-semibold text-gray-900">Environment checks</h2>
                                <div className="mt-6 grid gap-4">
                                    {envChecks.map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                                            <span className="font-medium text-gray-800">{key}</span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {value ? 'Configured' : 'Missing'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-3xl bg-white p-8 shadow">
                                <h2 className="text-2xl font-semibold text-gray-900">Database message</h2>
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
        </main>
    );
}
