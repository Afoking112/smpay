function validateRequiredEnv(requiredKeys = [], env = process.env) {
    const missingKeys = requiredKeys.filter((key) => {
        const value = env[key];
        return typeof value !== 'string' || value.trim() === '';
    });

    return {
        ok: missingKeys.length === 0,
        missingKeys,
    };
}

function isValidEmail(value = '') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function sanitizeAmount(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
        return null;
    }

    return Math.round(amount * 100) / 100;
}

function validateSignupInput(input = {}) {
    const name = String(input.name || '').trim();
    const phone = String(input.phone || '').trim();
    const email = String(input.email || '').trim().toLowerCase();
    const password = String(input.password || '');

    if (!name || !phone || !email || !password) {
        return { ok: false, error: 'All fields are required' };
    }

    if (!isValidEmail(email)) {
        return { ok: false, error: 'Please enter a valid email address' };
    }

    if (password.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters' };
    }

    return {
        ok: true,
        normalized: { name, phone, email, password },
    };
}

function validateAmount(value, label = 'Amount') {
    const sanitized = sanitizeAmount(value);

    if (sanitized === null) {
        return { ok: false, error: `${label} must be greater than zero` };
    }

    return { ok: true, amount: sanitized };
}

function validateAdminRole(role = '') {
    return role === 'admin' ? 'admin' : 'user';
}

function validatePasswordResetInput(input = {}) {
    const email = String(input.email || '').trim().toLowerCase();
    const phone = String(input.phone || '').trim();

    if (!isValidEmail(email)) {
        return { ok: false, error: 'Please enter a valid email address' };
    }

    if (!phone) {
        return { ok: false, error: 'Phone number is required' };
    }

    return {
        ok: true,
        normalized: { email, phone },
    };
}

function validatePasswordResetOtpInput(input = {}) {
    const email = String(input.email || '').trim().toLowerCase();
    const otp = String(input.otp || '').trim();
    const newPassword = String(input.newPassword || '');

    if (!isValidEmail(email)) {
        return { ok: false, error: 'Please enter a valid email address' };
    }

    if (!/^\d{6}$/.test(otp)) {
        return { ok: false, error: 'OTP must be a 6-digit code' };
    }

    if (newPassword.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters' };
    }

    return {
        ok: true,
        normalized: { email, otp, newPassword },
    };
}

module.exports = {
    validateRequiredEnv,
    isValidEmail,
    sanitizeAmount,
    validateSignupInput,
    validateAmount,
    validateAdminRole,
    validatePasswordResetInput,
    validatePasswordResetOtpInput,
};
