import axios from 'axios';
import generateReference from '../utils/reference.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = 'https://api.paystack.co';

function getHeaders() {
    return {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
    };
}

function normalizePaystackErrorMessage(error, fallbackMessage = 'Paystack request failed') {
    const rawMessage = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || '';

    const message = String(rawMessage || '').trim();
    const lower = message.toLowerCase();

    if (!message) {
        return fallbackMessage;
    }

    if ((lower.includes('starter business') || lower.includes('third party payouts') || lower.includes('third-party payouts')) && (lower.includes('cannot') || lower.includes('not') || lower.includes('permission') || lower.includes('payout'))) {
        return 'Your Paystack account is not currently approved for third-party payouts. Please complete the required business verification and payout setup in Paystack, or contact Paystack support to enable transfers.';
    }

    if (lower.includes('request payout') || lower.includes('payout permission') || lower.includes('permission') || lower.includes('role') || lower.includes('admin')) {
        return 'Your Paystack account does not currently have the required payout permissions. Please contact the Paystack business administrator or support to enable transfer access.';
    }

    return message;
}

export function getPaystackErrorMessage(error, fallbackMessage = 'Paystack request failed') {
    return normalizePaystackErrorMessage(error, fallbackMessage);
}

export function generateTransferReference() {
    return `wdr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const initializePayment = async (email, amount, userId) => {
    const reference = generateReference('FUND');

    const response = await axios.post(`${BASE_URL}/transaction/initialize`, {
        email,
        amount: amount * 100,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?ref=${reference}`,
        metadata: { type: 'wallet_fund', userId },
    }, {
        headers: getHeaders(),
    });

    return {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
    };
};

export const verifyPayment = async (reference) => {
    const response = await axios.get(`${BASE_URL}/transaction/verify/${reference}`, {
        headers: getHeaders(),
    });

    return response.data.data;
};

export const listBanks = async () => {
    const response = await axios.get(`${BASE_URL}/bank`, {
        headers: getHeaders(),
        params: {
            country: 'nigeria',
            currency: 'NGN',
        },
    });

    return response.data.data;
};

export const resolveAccountNumber = async (accountNumber, bankCode) => {
    const response = await axios.get(`${BASE_URL}/bank/resolve`, {
        headers: getHeaders(),
        params: {
            account_number: accountNumber,
            bank_code: bankCode,
        },
    });

    return response.data.data;
};

export const createTransferRecipient = async ({
    name,
    accountNumber,
    bankCode,
}) => {
    const response = await axios.post(`${BASE_URL}/transferrecipient`, {
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
    }, {
        headers: getHeaders(),
    });

    return response.data.data;
};

export const initiateTransfer = async ({
    recipient,
    amount,
    reference,
    reason,
}) => {
    const response = await axios.post(`${BASE_URL}/transfer`, {
        source: 'balance',
        amount: Math.round(amount * 100),
        recipient,
        reference,
        reason,
        currency: 'NGN',
    }, {
        headers: getHeaders(),
    });

    return response.data.data;
};
