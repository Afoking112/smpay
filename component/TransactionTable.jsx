"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { TRANSACTIONS_QUERY } from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';

export default function Transactions() {
    const [serviceFilter, setServiceFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const [search, setSearch] = useState('');

    const { data, loading, error } = useQuery(TRANSACTIONS_QUERY, {
        variables: { limit: 50, offset: 0 },
    });

    const transactions = useMemo(() => data?.transactions ?? [], [data]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const matchesService = serviceFilter === 'all' || transaction.service === serviceFilter;
            const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
            const haystack = `${transaction.service} ${transaction.reference || ''}`.toLowerCase();

            const matchesSearch = !search || haystack.includes(search.toLowerCase());

            return matchesService && matchesType && matchesSearch;

        });
    }, [search, serviceFilter, typeFilter, transactions]);


    const serviceOptions = useMemo(
        () => ['all', ...new Set(transactions.map((transaction) => transaction.service))],
        [transactions]
    );

    const typeOptions = useMemo(() => ['all', 'credit', 'debit'], []);


    if (loading) {
        return <div className="app-card rounded-[1.75rem] p-6 text-[#b7c6d7]">Loading transactions...</div>;
    }

    if (error) {
        return <div className="app-card rounded-[1.75rem] p-6 text-red-300">Error loading transactions</div>;
    }

    return (
        <div id="transactions-section" className="app-card rounded-[1.75rem] p-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">
                        Transaction History
                    </h2>
                    <p className="mt-1 text-sm text-[#8ea4ba]">
                        Filter your wallet activity by service, type, or reference.
                    </p>

                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by service or reference"
                        className="app-input px-3 py-2 text-sm"
                    />
                    <select
                        value={serviceFilter}
                        onChange={(event) => setServiceFilter(event.target.value)}
                        className="app-input px-3 py-2 text-sm"
                    >
                        {serviceOptions.map((service) => (
                            <option key={service} value={service}>
                                {service === 'all' ? 'All services' : service}
                            </option>
                        ))}
                    </select>
                    <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                        className="app-input px-3 py-2 text-sm"
                    >
                        <option value="all">All types</option>
                        {typeOptions.filter((t) => t !== 'all').map((type) => (
                            <option key={type} value={type}>
                                {type === 'credit' ? 'Credit' : 'Debit'}
                            </option>
                        ))}
                    </select>

                </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="app-subcard rounded-[1.4rem] p-4">

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00d5ff]">Visible Transactions</p>
                    <p className="mt-2 text-2xl font-bold text-white">{filteredTransactions.length}</p>
                </div>
                <div className="app-subcard rounded-[1.4rem] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7df2c8]">Credit Count</p>
                    <p className="mt-2 text-2xl font-bold text-white">
                        {filteredTransactions.filter((item) => item.type === 'credit').length}
                    </p>
                </div>
                <div className="app-subcard rounded-[1.4rem] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffb347]">Debit Count</p>
                    <p className="mt-2 text-2xl font-bold text-white">
                        {filteredTransactions.filter((item) => item.type === 'debit').length}
                    </p>
                </div>

            </div>

            {filteredTransactions.length > 0 ? (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-[#8ea4ba]">
                                <th className="py-2">Service</th>
                                <th>Amount</th>
                                <th>Type</th>

                                <th>Reference</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b border-white/8 text-[#dce6f0]">
                                    <td className="py-3">{transaction.service}</td>
                                    <td>{formatCurrency(transaction.amount)}</td>
                                    <td>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${transaction.type === 'credit'
                                                ? 'bg-[#7df2c8]/14 text-[#7df2c8]'
                                                : 'bg-[#ffb347]/14 text-[#ffb347]'
                                                }`}
                                        >
                                            {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                                        </span>
                                    </td>

                                    <td className="text-[#8ea4ba]">{transaction.reference || 'N/A'}</td>
                                    <td className="text-[#8ea4ba]">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="mt-6 py-8 text-center text-[#8ea4ba]">
                    No transactions match the current filters yet.
                </div>
            )}
        </div>
    );
}
