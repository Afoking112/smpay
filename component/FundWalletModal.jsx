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
            <div className="dialog-surface rounded-[2rem] p-8 text-white shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Fund Wallet</h2>
                    <button type="button" onClick={requestClose} className="text-[#8ea4ba] hover:text-white text-xl font-bold">
                        x
                    </button>
                </div>

                <p className="mb-4 text-sm text-[#8ea4ba]">
                    Start a secure Paystack checkout. After payment, you will return here and we will confirm the wallet credit.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#dce6f0] mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            min="50"
                            step="10"
                            className="app-input"
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    {amount ? (
                        <div className="app-subcard rounded-[1.25rem] p-3 text-sm text-[#b7c6d7]">
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
                        className="button-primary w-full px-4 py-3 text-sm disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Pay with Paystack'}
                    </button>
                </form>

                <div className="app-subcard mt-6 rounded-[1.25rem] p-4">
                    <p className="text-xs text-[#b7c6d7]">
                        Secure payment powered by Paystack. Minimum funding amount is NGN 50.
                    </p>
                </div>
            </div>
        </dialog>
    );
}
