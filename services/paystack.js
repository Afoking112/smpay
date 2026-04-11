import axios from 'axios';
import generateReference from '../utils/reference.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = 'https://api.paystack.co';

export const initializePayment = async (email, amount, userId) => {
    const reference = generateReference('FUND');

    const response = await axios.post(`${BASE_URL}/transaction/initialize`, {
        email,
        amount: amount * 100, // kobo
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?ref=${reference}`,
        metadata: { type: 'wallet_fund', userId }
    }, {
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            'Content-Type': 'application/json'
        }
    });

    return {
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference
    };
};

export const verifyPayment = async (reference) => {
    const response = await axios.get(`${BASE_URL}/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
    });

    return response.data.data;
};

