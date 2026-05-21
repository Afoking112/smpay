import nodemailer from 'nodemailer';

function parseRecipientList(value = '') {
    return value
        .split(/[,\n;]/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function getUniqueRecipients(recipients) {
    return Array.from(new Set(recipients.filter(Boolean)));
}

function looksLikeGmailAppPassword(password = '') {
    const normalized = password.replace(/\s+/g, '');
    return /^[a-zA-Z0-9]{16}$/.test(normalized);
}

export function getConfiguredAdminAlertRecipients() {
    return getUniqueRecipients([
        ...parseRecipientList(process.env.ADMIN_ALERT_EMAILS || ''),
        ...parseRecipientList(process.env.ADMIN_EMAIL || ''),
    ]);
}

function getReadableEmailError(error) {
    if (!error) {
        return 'Unknown email error';
    }

    if (error.code === 'EAUTH') {
        const isGmailHost = (process.env.SMTP_HOST || '').toLowerCase().includes('gmail');

        if (isGmailHost && !looksLikeGmailAppPassword(process.env.SMTP_PASS || '')) {
            return 'SMTP authentication failed. Gmail requires a 16-character App Password in SMTP_PASS, not the normal Gmail password.';
        }

        return 'SMTP authentication failed. Check that your SMTP username and password are correct.';
    }

    if (error.code === 'ESOCKET') {
        return `SMTP connection failed: ${error.message}`;
    }

    return error.message || 'Unknown email error';
}

async function sendEmail({ recipients, subject, text, replyTo }) {
    console.log('[EMAIL SERVICE] Recipients:', recipients);
    console.log('[EMAIL SERVICE] From:', process.env.SMTP_FROM || process.env.SMTP_USER);

    if (!Array.isArray(recipients) || recipients.length === 0) {
        console.log('[EMAIL SERVICE] No recipients configured');
        return { sent: false, reason: 'No recipients configured' };
    }

    const { transporter, missingSettings } = getTransporter();
    if (!transporter) {
        console.log('[EMAIL SERVICE] No transporter - missing SMTP settings:', missingSettings.join(', ') || 'Unknown');
        return { sent: false, reason: 'SMTP settings are not configured' };
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    console.log('[EMAIL SERVICE] SMTP transporter created');

    try {
        const info = await transporter.sendMail({
            from,
            to: recipients.join(', '),
            subject,
            text,
            replyTo: replyTo || undefined,
        });
        console.log('[EMAIL SERVICE] Email sent successfully to:', recipients.join(', '));
        console.log('[EMAIL SERVICE] Accepted recipients:', info.accepted);
        console.log('[EMAIL SERVICE] Rejected recipients:', info.rejected);
        return { sent: true, accepted: info.accepted, rejected: info.rejected };
    } catch (error) {
        console.error('[EMAIL SERVICE] Send mail failed:', error);
        return { sent: false, reason: getReadableEmailError(error) };
    }
}

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const missingSettings = [
        ['SMTP_HOST', host],
        ['SMTP_USER', user],
        ['SMTP_PASS', pass],
    ]
        .filter(([, value]) => !value)
        .map(([name]) => name);

    if (!host || !port || !user || !pass) {
        return {
            transporter: null,
            missingSettings,
        };
    }

    return {
        transporter: nodemailer.createTransport({
            host,
            port,
            secure: process.env.SMTP_SECURE === 'true' || port === 465,
            auth: {
                user,
                pass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
        }),
        missingSettings: [],
    };
}

export async function sendAdminGiftCardAlert({
    recipients,
    userName,
    userEmail,
    userPhone,
    preferredChannel,
    contactHandle,
    message,
}) {
    console.log('[EMAIL SERVICE] sendAdminGiftCardAlert called');
    return sendEmail({
        recipients,
        subject: `Gift card chat alert from ${userName}`,
        text: [
            `A user started or updated a gift card chat.`,
            ``,
            `Name: ${userName}`,
            `Email: ${userEmail}`,
            `Phone: ${userPhone}`,
            `Preferred channel: ${preferredChannel}`,
            `Contact handle: ${contactHandle || 'Not provided'}`,
            ``,
            `Message:`,
            message,
        ].join('\n'),
        replyTo: userEmail || undefined,
    });
}

export async function sendPasswordResetOtp({
    recipient,
    userName,
    otp,
}) {
    console.log('[EMAIL SERVICE] sendPasswordResetOtp called');

    return sendEmail({
        recipients: [recipient],
        subject: 'SM Pay password reset code',
        text: [
            `Hello ${userName || 'there'},`,
            ``,
            `Use this 6-digit OTP to reset your SM Pay password: ${otp}`,
            ``,
            `This code expires in 10 minutes.`,
            `If you did not request this change, ignore this email.`,
        ].join('\n'),
    });
}
