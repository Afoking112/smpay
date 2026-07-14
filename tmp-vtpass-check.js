const fs = require('fs');
const axios = require('axios');
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
const auth = env.VTPASS_PUBLIC_KEY && env.VTPASS_SECRET_KEY
    ? `${env.VTPASS_PUBLIC_KEY}:${env.VTPASS_SECRET_KEY}`
    : env.VTPASS_API_KEY;
const payload = {
    serviceID: 'airtime',
    serviceClass: 'mtn',
    billingPhone: '08012345678',
    amount: 100,
    reference: 'test-ref',
    customer_name: '08012345678'
};
axios.post('https://sandbox.vtpass.com/api/pay', payload, {
    headers: {
        Authorization: `Basic ${Buffer.from(auth).toString('base64')}`,
        'Content-Type': 'application/json'
    }
}).then((res) => {
    console.log(JSON.stringify(res.data));
}).catch((err) => {
    console.log(JSON.stringify({
        status: err.response && err.response.status,
        data: err.response && err.response.data,
        message: err.message
    }));
});
