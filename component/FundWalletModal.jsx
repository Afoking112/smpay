"use client";

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { FUND_WALLET_MUTATION } from '@/lib/queries';
import { formatCurrency } from '@/utils/currency';

export default function FundWalletModal({ isOpen, onClose }) {
    const [amount, setAmount] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [fundWallet, { loading }] = useMutation(FUND_WALLET_MUTATION);
    const dialogRef = useRef(null);

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
        setAmount('');
        setSubmitError('');
        onClose?.();
    };

    const requestClose = () => {
        dialogRef.current?.close();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError('');

        try {
            const { data } = await fundWallet({ variables: { amount: parseFloat(amount) } });
            if (data.fundWallet.success) {
                window.location.href = data.fundWallet.data.authorization_url;
            }
        } catch (error) {
            setSubmitError(error.message);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            className="p-0 m-0 max-w-md w-full mx-auto max-h-[90vh] backdrop:bg-black/50"
            onClose={handleDialogClose}
            onCancel={handleDialogClose}
        >
            <div className="bg-white rounded-xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Fund Wallet</h2>
                    <button type="button" onClick={requestClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
                        x
                    </button>
                </div>

                <p className="mb-4 text-sm text-gray-500">
                    Start a secure Paystack checkout. After payment, you will return here and we will confirm the wallet credit.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            min="50"
                            step="10"
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    {amount ? (
                        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            You are about to fund {formatCurrency(amount)}.
                        </div>
                    ) : null}

                    {submitError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {submitError}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading || !amount}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                    >
                        {loading ? 'Processing...' : 'Pay with Paystack'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
                    <p className="text-xs text-blue-800">
                        Secure payment powered by Paystack. Minimum funding amount is NGN 50.
                    </p>
                </div>
            </div>
        </dialog>
    );
}
