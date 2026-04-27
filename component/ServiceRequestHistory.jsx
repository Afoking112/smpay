"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { SERVICE_REQUESTS_QUERY } from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';

export default function ServiceRequestHistory() {
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const { data, loading, error } = useQuery(SERVICE_REQUESTS_QUERY, {
        variables: { limit: 20 },
    });

    const requests = useMemo(() => data?.serviceRequests ?? [], [data]);
    const categories = useMemo(
        () => ['all', ...new Set(requests.map((request) => request.category))],
        [requests]
    );

    const filteredRequests = useMemo(() => {
        return requests.filter((request) => {
            const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
            return matchesCategory && matchesStatus;
        });
    }, [categoryFilter, requests, statusFilter]);

    if (loading) {
        return <div className="rounded-2xl bg-white p-6 shadow">Loading service requests...</div>;
    }

    if (error) {
        return <div className="rounded-2xl bg-white p-6 shadow text-red-500">Error loading service request history</div>;
    }

    return (
        <section className="rounded-2xl bg-white p-6 shadow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Service Request History</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Track manual-review requests for gift cards, airtime-to-cash, electricity, and cable TV.
                    </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All categories' : category}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Review">In Review</option>
                        <option value="Completed">Completed</option>
                        <option value="Declined">Declined</option>
                    </select>
                </div>
            </div>

            {filteredRequests.length > 0 ? (
                <div className="mt-6 grid gap-4">
                    {filteredRequests.map((request) => (
                        <article key={request.id} className="rounded-2xl border border-gray-100 p-5">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                                        {request.category}
                                    </p>
                                    <h3 className="mt-2 text-lg font-semibold text-gray-900">{request.title}</h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        {request.provider || 'Provider pending'}{request.accountOrPhone ? ` | ${request.accountOrPhone}` : ''}
                                    </p>
                                    {request.note ? (
                                        <p className="mt-3 text-sm leading-6 text-gray-600">{request.note}</p>
                                    ) : null}
                                    {request.expectedCredit ? (
                                        <p className="mt-3 text-sm font-medium text-emerald-600">
                                            Net credit after {request.feePercentage || 0}% charge: {formatCurrency(request.expectedCredit)}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="text-left md:text-right">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                        request.status === 'Completed'
                                            ? 'bg-green-100 text-green-700'
                                            : request.status === 'Declined'
                                                ? 'bg-red-100 text-red-700'
                                                : request.status === 'In Review'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {request.status}
                                    </span>
                                    <p className="mt-3 text-lg font-semibold text-gray-900">
                                        {formatCurrency(request.amount || 0)}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {new Date(request.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                    No service requests match the current filters yet.
                </div>
            )}
        </section>
    );
}
