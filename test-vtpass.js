/* eslint-disable @typescript-eslint/no-require-imports */
const axios = require('axios');

async function testVTpass() {
    const key = `PK_3194bd59bbf7e2b8ef95942b7bcd89a8b3bd3d23c42:SK_534fa5dfc7ad065d93099fb628034f713cae87dcdc0`;
    const b64 = Buffer.from(key).toString('base64');

    const payload = {
        serviceID: 'airtime',
        serviceClass: 'mtn',
        billingPhone: '08000000000',
        amount: '50',
        reference: 'TEST_AIRTIME_NEW',
        customer_name: 'test'
    };

    try {
        const response = await axios.post('https://sandbox.vtpass.com/api/pay', payload, {
            headers: {
                'Authorization': `Basic ${b64}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('ERROR:', JSON.stringify(error.response ? error.response.data : error.message, null, 2));
        console.log('Status:', error.response ? error.response.status : 'No response');
        console.log('Full error:', error.message);
    }
}

testVTpass();
