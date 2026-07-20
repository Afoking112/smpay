import axios from 'axios';
import generateReference from '../utils/reference.js';

const VT_PASS_URL = 'https://sandbox.vtpass.com/api';

export function getVtpassAuthValue(env = process.env) {
    if (env.VTPASS_USERNAME && env.VTPASS_PASSWORD) {
        return `${env.VTPASS_USERNAME}:${env.VTPASS_PASSWORD}`;
    }

    if (env.VTPASS_PUBLIC_KEY && env.VTPASS_SECRET_KEY) {
        return `${env.VTPASS_PUBLIC_KEY}:${env.VTPASS_SECRET_KEY}`;
    }

    if (env.VTPASS_API_KEY) {
        return env.VTPASS_API_KEY;
    }

    return '';
}

export function normalizeProviderError(error) {
    if (!error) {
        return 'VTpass request failed';
    }

    if (typeof error === 'string') {
        return error;
    }

    if (typeof error === 'object') {
        const statusCode = error.response?.status;

        if (typeof error.response?.data === 'string') {
            return statusCode
                ? `VTpass rejected the request (${statusCode}): ${error.response.data}`
                : error.response.data;
        }

        if (error.response?.data && typeof error.response.data === 'object') {
            const providerMessage = error.response.data.response_description
                || error.response.data.message
                || error.response.data.error
                || error.response.data.detail;

            if (typeof providerMessage === 'string' && providerMessage.trim()) {
                return statusCode
                    ? `VTpass rejected the request (${statusCode}): ${providerMessage}`
                    : providerMessage;
            }

            return JSON.stringify(error.response.data);
        }

        if (typeof error.message === 'string' && error.message.trim()) {
            return error.message;
        }
    }

    return 'VTpass request failed';
}

export const buyAirtime = async (phone, network, amount) => {
    const reference = generateReference('AIRTIME');
    const vtpassAuth = getVtpassAuthValue();

    if (!vtpassAuth) {
        return {
            success: false,
            error: 'VTpass credentials are not configured. Please set VTPASS_API_KEY, VTPASS_PUBLIC_KEY and VTPASS_SECRET_KEY, or VTPASS_USERNAME and VTPASS_PASSWORD.',
            reference,
        };
    }

    const payload = {
        serviceID: 'airtime',
        serviceClass: network.toLowerCase(), // mtn, glo, airtel, 9mobile
        billingPhone: phone,
        amount,
        reference,
        customer_name: phone // VTpass requirement
    };

    try {
        const response = await axios.post(`${VT_PASS_URL}/pay`, payload, {
            headers: {
                'Authorization': `Basic ${Buffer.from(vtpassAuth).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data,
            reference
        };
    } catch (error) {
        return {
            success: false,
            error: normalizeProviderError(error),
            reference
        };
    }
};

export const buyData = async (phone, network, planId) => {
    const reference = generateReference('DATA');
    const vtpassAuth = getVtpassAuthValue();

    if (!vtpassAuth) {
        return {
            success: false,
            error: 'VTpass credentials are not configured. Please set VTPASS_API_KEY, VTPASS_PUBLIC_KEY and VTPASS_SECRET_KEY, or VTPASS_USERNAME and VTPASS_PASSWORD.',
            reference,
        };
    }

    const payload = {
        serviceID: 'data_bundle',
        serviceClass: `${network.toLowerCase()}-prepaid`, // mtn-prepaid, glo-prepaid etc
        billingPhone: phone,
        plan_id: planId, // VTpass plan ID
        reference,
        customer_name: phone
    };

    try {
        const response = await axios.post(`${VT_PASS_URL}/pay`, payload, {
            headers: {
                'Authorization': `Basic ${Buffer.from(vtpassAuth).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data,
            reference
        };
    } catch (error) {
        return {
            success: false,
            error: normalizeProviderError(error),
            reference
        };
    }
};

