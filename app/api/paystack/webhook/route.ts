import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '../../../../lib/mongodb.js';
import Transaction from '../../../../models/Transaction.js';
import User from '../../../../models/User.js';
import { verifyPayment } from '../../../../services/paystack.js';
import { creditWallet } from '../../../../services/transaction.js';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const signature = request.headers.get('x-paystack-signature');
        const body = await request.text();

        const expectedSignature = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
            .update(body)
            .digest('hex');

        if (!signature || signature !== expectedSignature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);

        if (event.event === 'charge.success') {
            const paymentData = await verifyPayment(event.data.reference);

            if (paymentData.status === 'success') {
                const userId = paymentData.metadata?.userId || paymentData.metadata?.custom_fields?.[0]?.value;
                const user = await User.findById(userId);
                if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

                const existingTransaction = await Transaction.findOne({ reference: paymentData.reference });
                if (existingTransaction?.status === 'Success') {
                    return NextResponse.json({ success: true });
                }

                await creditWallet(user._id, Number(paymentData.amount) / 100);

                await Transaction.findOneAndUpdate(
                    { reference: paymentData.reference },
                    {
                        userId: user._id,
                        service: 'Wallet Funding',
                        amount: Number(paymentData.amount) / 100,
                        status: 'Success',
                        type: 'credit',
                    },
                    { upsert: true, new: true }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

