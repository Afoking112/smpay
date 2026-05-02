import nodemailer from 'nodemailer';

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
        return null;
    }

    return nodemailer.createTransporter({
        host,
        port,
        secure: process.env.SMTP_SECURE === 'true' || port === 465,
        auth: {
            user,
            pass,
        },
    });
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
    console.log('[EMAIL SERVICE] Recipients:', recipients);
    console.log('[EMAIL SERVICE] From:', process.env.SMTP_FROM || process.env.SMTP_USER);

    if (!Array.isArray(recipients) || recipients.length === 0) {
        console.log('[EMAIL SERVICE] No recipients configured');
        return { sent: false, reason: 'No admin recipients configured' };
    }

    const transporter = getTransporter();
    if (!transporter) {
        console.log('[EMAIL SERVICE] No transporter - check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
        return { sent: false, reason: 'SMTP settings are not configured' };
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    console.log('[EMAIL SERVICE] SMTP transporter created');

    try {
        await transporter.sendMail({
            from,
            to: recipients.join(', '),
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
        });
        console.log('[EMAIL SERVICE] Email sent successfully to:', recipients.join(', '));
        return { sent: true };
    } catch (error) {
        console.error('[EMAIL SERVICE] Send mail failed:', error);
        return { sent: false, reason: error.message };
    }
}
