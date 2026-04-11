"use client";

import { useMemo, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
    BUY_AIRTIME_MUTATION,
    BUY_DATA_MUTATION,
    SERVICE_REQUESTS_QUERY,
    SUBMIT_SERVICE_REQUEST_MUTATION,
    TRANSACTIONS_QUERY,
    WALLET_BALANCE_QUERY,
} from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';
import { getDataPlansForNetwork } from '@/utils/dataPlans';

const networkOptions = ['MTN', 'GLO', 'AIRTEL', '9MOBILE'];

const serviceContent = {
    airtime: {
        title: 'Buy Airtime',
        description: 'Top up any supported network directly from your wallet.',
    },
    data: {
        title: 'Buy Data',
        description: 'Choose from a starter plan catalog instead of entering a raw provider plan ID.',
    },
    'gift-card': {
        title: 'Gift Card Request',
        description: 'Submit a gift card buy or sell request for manual review and follow-up.',
    },
    'airtime-cash': {
        title: 'Airtime to Cash Request',
        description: 'Submit a conversion request and track its review status in your service history.',
    },
    electricity: {
        title: 'Electricity Bill Request',
        description: 'Send a meter payment request for review until a live bill provider is connected.',
    },
    'cable-tv': {
        title: 'Cable TV Subscription Request',
        description: 'Create a renewal request and track its processing status from your dashboard.',
    },
};

export default function ServicePurchasePanel({ service, onClose }) {
    const [airtimeForm, setAirtimeForm] = useState({
        phone: '',
        network: 'MTN',
        amount: '',
    });
    const [dataForm, setDataForm] = useState({
        phone: '',
        network: 'MTN',
        planId: getDataPlansForNetwork('MTN')[0]?.providerPlanId || '',
    });
    const [requestForm, setRequestForm] = useState({
        provider: '',
        accountOrPhone: '',
        amount: '',
        direction: '',
        note: '',
    });
    const [feedback, setFeedback] = useState(null);

    const dataPlans = useMemo(() => getDataPlansForNetwork(dataForm.network), [dataForm.network]);
    const selectedDataPlan = dataPlans.find((plan) => plan.providerPlanId === dataForm.planId) || dataPlans[0] || null;

    const refetchQueries = useMemo(
        () => [
            { query: WALLET_BALANCE_QUERY },
            { query: TRANSACTIONS_QUERY, variables: { limit: 50, offset: 0 } },
            { query: SERVICE_REQUESTS_QUERY, variables: { limit: 20 } },
        ],
        []
    );

    const [buyAirtime, { loading: airtimeLoading }] = useMutation(BUY_AIRTIME_MUTATION, {
        refetchQueries,
        awaitRefetchQueries: true,
    });
    const [buyData, { loading: dataLoading }] = useMutation(BUY_DATA_MUTATION, {
        refetchQueries,
        awaitRefetchQueries: true,
    });
    const [submitServiceRequest, { loading: requestLoading }] = useMutation(SUBMIT_SERVICE_REQUEST_MUTATION, {
        refetchQueries,
        awaitRefetchQueries: true,
    });

    if (!service) {
        return null;
    }

    const content = serviceContent[service] || serviceContent.airtime;
    const loading = airtimeLoading || dataLoading || requestLoading;
    const resetFeedback = () => setFeedback(null);

    const handleAirtimeSubmit = async (event) => {
        event.preventDefault();
        resetFeedback();

        try {
            const { data } = await buyAirtime({
                variables: {
                    input: {
                        phone: airtimeForm.phone,
                        network: airtimeForm.network,
                        amount: Number(airtimeForm.amount),
                    },
                },
            });

            setFeedback({
                kind: data.buyAirtime.success ? 'success' : 'error',
                message: data.buyAirtime.message,
                reference: data.buyAirtime.transaction?.reference || '',
            });

            if (data.buyAirtime.success) {
                setAirtimeForm({
                    phone: '',
                    network: airtimeForm.network,
                    amount: '',
                });
            }
        } catch (error) {
            setFeedback({ kind: 'error', message: error.message, reference: '' });
        }
    };

    const handleDataSubmit = async (event) => {
        event.preventDefault();
        resetFeedback();

        try {
            const { data } = await buyData({
                variables: {
                    input: {
                        phone: dataForm.phone,
                        network: dataForm.network,
                        planId: selectedDataPlan?.providerPlanId || dataForm.planId,
                        amount: Number(selectedDataPlan?.amount || 0),
                    },
                },
            });

            setFeedback({
                kind: data.buyData.success ? 'success' : 'error',
                message: data.buyData.message,
                reference: data.buyData.transaction?.reference || '',
            });

            if (data.buyData.success) {
                setDataForm({
                    phone: '',
                    network: dataForm.network,
                    planId: getDataPlansForNetwork(dataForm.network)[0]?.providerPlanId || '',
                });
            }
        } catch (error) {
            setFeedback({ kind: 'error', message: error.message, reference: '' });
        }
    };

    const buildServiceRequestInput = () => {
        if (service === 'gift-card') {
            return {
                category: 'Gift Card',
                title: requestForm.direction === 'sell' ? 'Gift card sell request' : 'Gift card buy request',
                provider: requestForm.provider,
                accountOrPhone: requestForm.accountOrPhone,
                amount: Number(requestForm.amount || 0),
                direction: requestForm.direction || 'sell',
                note: requestForm.note,
            };
        }

        if (service === 'airtime-cash') {
            return {
                category: 'Airtime to Cash',
                title: 'Airtime to cash request',
                provider: requestForm.provider,
                accountOrPhone: requestForm.accountOrPhone,
                amount: Number(requestForm.amount || 0),
                direction: 'convert',
                note: requestForm.note,
            };
        }

        if (service === 'electricity') {
            return {
                category: 'Electricity',
                title: 'Electricity bill payment request',
                provider: requestForm.provider,
                accountOrPhone: requestForm.accountOrPhone,
                amount: Number(requestForm.amount || 0),
                direction: 'pay',
                note: requestForm.note,
            };
        }

        return {
            category: 'Cable TV',
            title: 'Cable TV subscription request',
            provider: requestForm.provider,
            accountOrPhone: requestForm.accountOrPhone,
            amount: Number(requestForm.amount || 0),
            direction: 'pay',
            note: requestForm.note,
        };
    };

    const handleRequestSubmit = async (event) => {
        event.preventDefault();
        resetFeedback();

        try {
            const { data } = await submitServiceRequest({
                variables: {
                    input: buildServiceRequestInput(),
                },
            });

            setFeedback({
                kind: data.submitServiceRequest.success ? 'success' : 'error',
                message: data.submitServiceRequest.message,
                reference: data.submitServiceRequest.request?.id || '',
            });

            if (data.submitServiceRequest.success) {
                setRequestForm({
                    provider: '',
                    accountOrPhone: '',
                    amount: '',
                    direction: '',
                    note: '',
                });
            }
        } catch (error) {
            setFeedback({ kind: 'error', message: error.message, reference: '' });
        }
    };

    const requestLabels = {
        provider:
            service === 'gift-card'
                ? 'Card Brand'
                : service === 'airtime-cash'
                    ? 'Network'
                    : service === 'electricity'
                        ? 'Disco Provider'
                        : 'Cable Provider',
        accountOrPhone:
            service === 'gift-card'
                ? 'Contact Email or Phone'
                : service === 'airtime-cash'
                    ? 'Phone Number'
                    : service === 'electricity'
                        ? 'Meter Number'
                        : 'Smartcard Number',
    };

    return (
        <section className="rounded-2xl bg-white p-6 shadow">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {content.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {content.description}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                    Hide Panel
                </button>
            </div>

            {feedback ? (
                <div
                    className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                        feedback.kind === 'success'
                            ? 'border border-green-200 bg-green-50 text-green-700'
                            : 'border border-red-200 bg-red-50 text-red-600'
                    }`}
                >
                    <p>{feedback.message}</p>
                    {feedback.reference ? <p className="mt-1">Reference: {feedback.reference}</p> : null}
                </div>
            ) : null}

            {service === 'airtime' ? (
                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleAirtimeSubmit}>
                    <label className="text-sm font-medium text-gray-700">
                        Phone Number
                        <input
                            type="tel"
                            value={airtimeForm.phone}
                            onChange={(event) => setAirtimeForm({ ...airtimeForm, phone: event.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="08012345678"
                            required
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Network
                        <select
                            value={airtimeForm.network}
                            onChange={(event) => setAirtimeForm({ ...airtimeForm, network: event.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {networkOptions.map((network) => (
                                <option key={network} value={network}>
                                    {network}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-gray-700 md:col-span-2">
                        Amount
                        <input
                            type="number"
                            min="50"
                            step="10"
                            value={airtimeForm.amount}
                            onChange={(event) => setAirtimeForm({ ...airtimeForm, amount: event.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="500"
                            required
                        />
                    </label>
                    <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-4">
                        <p className="text-sm text-gray-600">
                            Wallet debit: {formatCurrency(airtimeForm.amount || 0)}
                        </p>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Processing...' : 'Buy Airtime'}
                        </button>
                    </div>
                </form>
            ) : null}

            {service === 'data' ? (
                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleDataSubmit}>
                    <label className="text-sm font-medium text-gray-700">
                        Phone Number
                        <input
                            type="tel"
                            value={dataForm.phone}
                            onChange={(event) => setDataForm({ ...dataForm, phone: event.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="08012345678"
                            required
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Network
                        <select
                            value={dataForm.network}
                            onChange={(event) => {
                                const nextNetwork = event.target.value;
                                const nextPlans = getDataPlansForNetwork(nextNetwork);
                                setDataForm({
                                    ...dataForm,
                                    network: nextNetwork,
                                    planId: nextPlans[0]?.providerPlanId || '',
                                });
                            }}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            {networkOptions.map((network) => (
                                <option key={network} value={network}>
                                    {network}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-sm font-medium text-gray-700 md:col-span-2">
                        Data Plan
                        <select
                            value={selectedDataPlan?.providerPlanId || ''}
                            onChange={(event) => setDataForm({ ...dataForm, planId: event.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            required
                        >
                            {dataPlans.map((plan) => (
                                <option key={plan.id} value={plan.providerPlanId}>
                                    {plan.label} - {formatCurrency(plan.amount)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        This starter catalog removes manual plan ID entry. Replace the default plan identifiers in the code with your exact VTpass production IDs before going live.
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-4">
                        <p className="text-sm text-gray-600">
                            Wallet debit: {formatCurrency(selectedDataPlan?.amount || 0)}
                        </p>
                        <button
                            type="submit"
                            disabled={loading || !selectedDataPlan}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Processing...' : 'Buy Data'}
                        </button>
                    </div>
                </form>
            ) : null}

            {!['airtime', 'data'].includes(service) ? (
                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleRequestSubmit}>
                    <label className="text-sm font-medium text-gray-700">
                        {requestLabels.provider}
                        <input
                            type="text"
                            value={requestForm.provider}
                            onChange={(event) => setRequestForm({ ...requestForm, provider: event.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder={requestLabels.provider}
                            required
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        {requestLabels.accountOrPhone}
                        <input
                            type="text"
                            value={requestForm.accountOrPhone}
                            onChange={(event) => setRequestForm({ ...requestForm, accountOrPhone: event.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder={requestLabels.accountOrPhone}
                            required
                        />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                        Amount
                        <input
                            type="number"
                            min="0"
                            step="10"
                            value={requestForm.amount}
                            onChange={(event) => setRequestForm({ ...requestForm, amount: event.target.value })}
                            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="5000"
                            required
                        />
                    </label>
                    {service === 'gift-card' ? (
                        <label className="text-sm font-medium text-gray-700">
                            Direction
                            <select
                                value={requestForm.direction}
                                onChange={(event) => setRequestForm({ ...requestForm, direction: event.target.value })}
                                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                required
                            >
                                <option value="">Select direction</option>
                                <option value="buy">Buy</option>
                                <option value="sell">Sell</option>
                            </select>
                        </label>
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            This flow currently creates a tracked manual-review request so operations can follow up without charging the wallet automatically.
                        </div>
                    )}
                    <label className="text-sm font-medium text-gray-700 md:col-span-2">
                        Notes
                        <textarea
                            value={requestForm.note}
                            onChange={(event) => setRequestForm({ ...requestForm, note: event.target.value })}
                            className="mt-2 min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Add useful details for manual review"
                        />
                    </label>
                    <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-4">
                        <p className="text-sm text-gray-600">
                            Request value: {formatCurrency(requestForm.amount || 0)}
                        </p>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            ) : null}
        </section>
    );
}
