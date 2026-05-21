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

export function getPaystackErrorMessage(error, fallbackMessage = 'Paystack request failed') {
    return error?.response?.data?.message || error?.message || fallbackMessage;
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
