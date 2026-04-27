import nodemailer from 'nodemailer';

function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
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
    if (!Array.isArray(recipients) || recipients.length === 0) {
        return { sent: false, reason: 'No admin recipients configured' };
    }

    const transporter = getTransporter();
    if (!transporter) {
        return { sent: false, reason: 'SMTP settings are not configured' };
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

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

    return { sent: true };
}
