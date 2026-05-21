import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import { getConfiguredAdminAlertRecipients } from '../../../services/email.js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const adminAlertRecipients = getConfiguredAdminAlertRecipients();
    const smtpConfigured = Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    );

    const checks = {
        env: {
            mongodb: Boolean(process.env.MONGODB_URI),
            jwt: Boolean(process.env.JWT_SECRET),
            paystack: Boolean(process.env.PAYSTACK_SECRET_KEY),
            vtpassPublicKey: Boolean(process.env.VTPASS_PUBLIC_KEY),
            vtpassSecretKey: Boolean(process.env.VTPASS_SECRET_KEY),
        },
        email: {
            smtpConfigured,
            adminAlertRecipientsConfigured: adminAlertRecipients.length > 0,
            adminAlertRecipientCount: adminAlertRecipients.length,
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
