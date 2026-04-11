"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { TRANSACTIONS_QUERY } from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';

export default function Transactions() {
    const [serviceFilter, setServiceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    const { data, loading, error } = useQuery(TRANSACTIONS_QUERY, {
        variables: { limit: 50, offset: 0 },
    });

    const transactions = useMemo(() => data?.transactions ?? [], [data]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const matchesService = serviceFilter === 'all' || transaction.service === serviceFilter;
            const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
            const haystack = `${transaction.service} ${transaction.reference || ''}`.toLowerCase();
            const matchesSearch = !search || haystack.includes(search.toLowerCase());

            return matchesService && matchesStatus && matchesSearch;
        });
    }, [search, serviceFilter, statusFilter, transactions]);

    const serviceOptions = useMemo(
        () => ['all', ...new Set(transactions.map((transaction) => transaction.service))],
        [transactions]
    );

    if (loading) {
        return <div className="bg-white p-6 rounded-xl shadow">Loading transactions...</div>;
    }

    if (error) {
        return <div className="bg-white p-6 rounded-xl shadow text-red-500">Error loading transactions</div>;
    }

    return (
        <div id="transactions-section" className="bg-white p-6 rounded-xl shadow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        Transaction History
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Filter your wallet activity by service, status, or reference.
                    </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by service or reference"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <select
                        value={serviceFilter}
                        onChange={(event) => setServiceFilter(event.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        {serviceOptions.map((service) => (
                            <option key={service} value={service}>
                                {service === 'all' ? 'All services' : service}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">All statuses</option>
                        <option value="Success">Success</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Visible Transactions</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Successful Value</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(filteredTransactions.filter((item) => item.status === 'Success').reduce((sum, item) => sum + item.amount, 0))}
                    </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Pending Count</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {filteredTransactions.filter((item) => item.status === 'Pending').length}
                    </p>
                </div>
            </div>

            {filteredTransactions.length > 0 ? (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2">Service</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Reference</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b">
                                    <td className="py-3">{transaction.service}</td>
                                    <td>{formatCurrency(transaction.amount)}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                transaction.status === 'Success'
                                                    ? 'bg-green-100 text-green-800'
                                                    : transaction.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td className="text-sm text-gray-500">{transaction.reference || 'N/A'}</td>
                                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="mt-6 text-gray-500 text-center py-8">
                    No transactions match the current filters yet.
                </div>
            )}
        </div>
    );
}
