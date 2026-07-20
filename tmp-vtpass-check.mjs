import fs from 'fs';
import axios from 'axios';

const env = {};
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx > -1) {
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
        env[key] = value;
    }
}

const candidates = [];
if (env.VTPASS_USERNAME && env.VTPASS_PASSWORD) {
    candidates.push({ label: 'username/password', auth: `${env.VTPASS_USERNAME}:${env.VTPASS_PASSWORD}` });
}
if (env.VTPASS_PUBLIC_KEY && env.VTPASS_SECRET_KEY) {
    candidates.push({ label: 'public/secret', auth: `${env.VTPASS_PUBLIC_KEY}:${env.VTPASS_SECRET_KEY}` });
}
if (env.VTPASS_API_KEY) {
    candidates.push({ label: 'api-key', auth: env.VTPASS_API_KEY });
}

const payload = {
    serviceID: 'airtime',
    serviceClass: 'mtn',
    billingPhone: '08012345678',
    amount: 100,
    reference: 'test-ref',
    customer_name: '08012345678'
};

for (const candidate of candidates) {
    try {
        const response = await axios.post('https://sandbox.vtpass.com/api/pay', payload, {
            headers: {
                Authorization: `Basic ${Buffer.from(candidate.auth).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(JSON.stringify({ label: candidate.label, success: true, data: response.data }, null, 2));
    } catch (error) {
        console.log(JSON.stringify({ label: candidate.label, success: false, status: error.response?.status, data: error.response?.data, message: error.message }, null, 2));
    }
}
