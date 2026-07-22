"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
    RESOLVE_WITHDRAWAL_ACCOUNT_MUTATION,
    TRANSACTIONS_QUERY,
    WALLET_BALANCE_QUERY,
    WITHDRAWAL_BANKS_QUERY,
    WITHDRAW_TO_BANK_MUTATION,
} from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';

const defaultFormState = {
    bankCode: '',
    accountNumber: '',
    accountName: '',
    amount: '',
    reason: '',
};

export default function WithdrawModal({ isOpen, onClose }) {
    const dialogRef = useRef(null);
    const [form, setForm] = useState(defaultFormState);
    const [submitError, setSubmitError] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [resolutionStatus, setResolutionStatus] = useState(null);

    const { data: banksData, loading: banksLoading, error: banksError } = useQuery(WITHDRAWAL_BANKS_QUERY, {
        skip: !isOpen,
        fetchPolicy: 'cache-first',
    });

    const banks = useMemo(() => banksData?.withdrawalBanks ?? [], [banksData]);
    const selectedBank = useMemo(
        () => banks.find((bank) => bank.code === form.bankCode) || null,
        [banks, form.bankCode]
    );
    const refetchQueries = useMemo(
        () => [
            { query: WALLET_BALANCE_QUERY },
            { query: TRANSACTIONS_QUERY, variables: { limit: 50, offset: 0 } },
        ],
        []
    );

    const [resolveWithdrawalAccount, { loading: resolvingAccount }] = useMutation(RESOLVE_WITHDRAWAL_ACCOUNT_MUTATION);
    const [withdrawToBank, { loading: withdrawing }] = useMutation(WITHDRAW_TO_BANK_MUTATION, {
        refetchQueries,
        awaitRefetchQueries: true,
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return;
        }

        if (isOpen && !dialog.open) {
            dialog.showModal();
        }

        if (!isOpen && dialog.open) {
            dialog.close();
        }
    }, [isOpen]);

    const handleDialogClose = () => {
        setForm(defaultFormState);
        setSubmitError('');
        setFeedback(null);
        setResolutionStatus(null);
        onClose?.();
    };

    const requestClose = () => {
        dialogRef.current?.close();
    };

    const handleFieldChange = (field, value) => {
        setSubmitError('');
        setFeedback(null);

        setForm((current) => ({
            ...current,
            [field]: value,
            ...(field === 'bankCode' || field === 'accountNumber'
                ? { accountName: '' }
                : {}),
        }));

        if (field === 'bankCode' || field === 'accountNumber') {
            setResolutionStatus(null);
        }
    };

    const handleResolveAccount = async () => {
        setSubmitError('');
        setFeedback(null);

        if (!form.bankCode) {
            setResolutionStatus({ kind: 'error', message: 'Select a bank first.' });
            return;
        }

        if (form.accountNumber.length !== 10) {
            setResolutionStatus({ kind: 'error', message: 'Enter a valid 10-digit account number.' });
            return;
        }

        try {
            const { data } = await resolveWithdrawalAccount({
                variables: {
                    accountNumber: form.accountNumber,
                    bankCode: form.bankCode,
                },
            });

            const accountName = data?.resolveWithdrawalAccount?.accountName || '';

            setForm((current) => ({
                ...current,
                accountName,
            }));
            setResolutionStatus({
                kind: 'success',
                message: data?.resolveWithdrawalAccount?.message || 'Account verified successfully.',
            });
        } catch (error) {
            setForm((current) => ({
                ...current,
                accountName: '',
            }));
            setResolutionStatus({ kind: 'error', message: error.message });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError('');
        setFeedback(null);

        if (!selectedBank) {
            setSubmitError('Select the destination bank.');
            return;
        }

        if (!form.accountName) {
            setSubmitError('Verify the account number before continuing.');
            return;
        }

        try {
            const { data } = await withdrawToBank({
                variables: {
                    input: {
                        bankCode: selectedBank.code,
                        bankName: selectedBank.name,
                        accountNumber: form.accountNumber,
                        accountName: form.accountName,
                        amount: Number(form.amount),
                        reason: form.reason,
                    },
                },
            });

            const result = data?.withdrawToBank;

            setFeedback({
                kind: result?.success ? 'success' : 'error',
                message: result?.message || 'Withdrawal request processed.',
                reference: result?.transaction?.reference || '',
            });

            if (result?.success) {
                setForm(defaultFormState);
                setResolutionStatus(null);
            }
        } catch (error) {
            setSubmitError(error.message);
        }
    };

    const amountPreview = Number(form.amount || 0);
    const loading = resolvingAccount || withdrawing;

    return (
        <dialog
            ref={dialogRef}
            className="p-0 m-0 max-w-2xl w-full mx-auto max-h-[92vh] backdrop:bg-black/50"
            onClose={handleDialogClose}
            onCancel={handleDialogClose}
        >
            <div className="dialog-surface rounded-[2rem] p-8 text-white shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Withdraw to Bank</h2>
                        <p className="mt-1 text-sm text-[#8ea4ba]">
                            Verify the account, then send funds directly from your wallet balance.
                        </p>
                    </div>
                    <button type="button" onClick={requestClose} className="text-[#8ea4ba] hover:text-white text-xl font-bold">
                        x
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-[#dce6f0]">
                            Bank
                            <select
                                value={form.bankCode}
                                onChange={(event) => handleFieldChange('bankCode', event.target.value)}
                                className="app-input mt-2"
                                required
                            >
                                <option value="">{banksLoading ? 'Loading banks...' : 'Select a bank'}</option>
                                {banks.map((bank, index) => (
                                    <option key={`${bank.code || 'bank'}-${bank.name || 'name'}-${index}`} value={bank.code}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="text-sm font-medium text-[#dce6f0]">
                            Account Number
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={10}
                                value={form.accountNumber}
                                onChange={(event) => handleFieldChange('accountNumber', event.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="app-input mt-2"
                                placeholder="0123456789"
                                required
                            />
                        </label>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <label className="flex-1 text-sm font-medium text-[#dce6f0]">
                            Account Name
                            <input
                                type="text"
                                value={form.accountName}
                                readOnly
                                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-[#dce6f0]"
                                placeholder="Verify account to auto-fill"
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleResolveAccount}
                            disabled={resolvingAccount || !form.bankCode || form.accountNumber.length !== 10}
                            className="button-secondary px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {resolvingAccount ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </div>

                    {resolutionStatus ? (
                        <div
                            className={`rounded-lg px-4 py-3 text-sm ${resolutionStatus.kind === 'success'
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                                }`}
                        >
                            {resolutionStatus.message}
                        </div>
                    ) : null}

                    {banksError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {banksError.message}
                        </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-[#dce6f0]">
                            Amount
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={form.amount}
                                onChange={(event) => handleFieldChange('amount', event.target.value)}
                                className="app-input mt-2"
                                placeholder="Enter amount"
                                required
                            />
                        </label>

                        <label className="text-sm font-medium text-[#dce6f0]">
                            Reason (Optional)
                            <input
                                type="text"
                                value={form.reason}
                                onChange={(event) => handleFieldChange('reason', event.target.value)}
                                className="app-input mt-2"
                                placeholder="Savings, bills, personal use"
                            />
                        </label>
                    </div>

                    {amountPreview > 0 ? (
                        <div className="app-subcard rounded-[1.25rem] p-3 text-sm text-[#b7c6d7]">
                            You are about to withdraw {formatCurrency(amountPreview)} to {form.accountName || 'the selected account'}.
                        </div>
                    ) : null}

                    {feedback ? (
                        <div
                            className={`rounded-lg px-4 py-3 text-sm ${feedback.kind === 'success'
                                    ? 'border border-green-200 bg-green-50 text-green-700'
                                    : 'border border-red-200 bg-red-50 text-red-700'
                                }`}
                        >
                            <p>{feedback.message}</p>
                            {feedback.reference ? (
                                <p className="mt-1 text-xs opacity-80">Reference: {feedback.reference}</p>
                            ) : null}
                        </div>
                    ) : null}

                    {submitError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {submitError}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading || !selectedBank || !form.accountName || !form.amount}
                        className="button-primary w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {withdrawing ? 'Submitting Withdrawal...' : 'Withdraw to Bank'}
                    </button>
                </form>

                <div className="app-subcard mt-6 rounded-[1.25rem] p-4">
                    <p className="text-xs text-[#b7c6d7]">
                        Withdrawals are recorded in your transaction history immediately. If the transfer provider reports a pending state, the debit remains pending until completion.
                    </p>
                </div>
            </div>
        </dialog>
    );
}
