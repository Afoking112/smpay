import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    const checks = {
        env: {
            mongodb: Boolean(process.env.MONGODB_URI),
            jwt: Boolean(process.env.JWT_SECRET),
            paystack: Boolean(process.env.PAYSTACK_SECRET_KEY),
            vtpassPublicKey: Boolean(process.env.VTPASS_PUBLIC_KEY),
            vtpassSecretKey: Boolean(process.env.VTPASS_SECRET_KEY),
        },
        db: {
            ok: false,
            message: '',
        },
    };

    try {
        await connectDB();
        checks.db.ok = true;
        checks.db.message = 'Database connection established';
    } catch (error) {
        checks.db.ok = false;
        checks.db.message = error instanceof Error ? error.message : 'Database connection failed';
    }

    const allEnvReady = Object.values(checks.env).every(Boolean);
    const ok = allEnvReady && checks.db.ok;

    return NextResponse.json(
        {
            ok,
            timestamp: new Date().toISOString(),
            checks,
        },
        { status: ok ? 200 : 503 }
    );
}
