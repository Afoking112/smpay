import axios from 'axios';
import generateReference from '../utils/reference.js';

const VT_PASS_URL = 'https://sandbox.vtpass.com/api';
const VT_PASS_KEY = `${process.env.VTPASS_PUBLIC_KEY}:${process.env.VTPASS_SECRET_KEY}`;

export const buyAirtime = async (phone, network, amount) => {
    const reference = generateReference('AIRTIME');

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
                'Authorization': `Basic ${Buffer.from(VT_PASS_KEY).toString('base64')}`,
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
            error: error.response?.data || error.message,
            reference
        };
    }
};

export const buyData = async (phone, network, planId) => {
    const reference = generateReference('DATA');

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
                'Authorization': `Basic ${Buffer.from(VT_PASS_KEY).toString('base64')}`,
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
            error: error.response?.data || error.message,
            reference
        };
    }
};

