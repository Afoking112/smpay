const { validatePasswordResetInput, validatePasswordResetOtpInput } = require('../utils/validation.js');
const { createRateLimiter } = require('../utils/rateLimit.js');

describe('password reset validation', () => {
    test('rejects invalid email and blank phone', () => {
        const result = validatePasswordResetInput({ email: 'bad-email', phone: '   ' });

        expect(result.ok).toBe(false);
        expect(result.error).toMatch(/valid email|phone number/i);
    });

    test('accepts a valid password reset payload', () => {
        const result = validatePasswordResetOtpInput({
            email: ' user@example.com ',
            otp: '123456',
            newPassword: 'secret123',
        });

        expect(result.ok).toBe(true);
        expect(result.normalized).toEqual({
            email: 'user@example.com',
            otp: '123456',
            newPassword: 'secret123',
        });
    });
});

describe('rate limiter', () => {
    test('blocks requests after the configured limit', () => {
        const limiter = createRateLimiter(2, 1000);

        expect(limiter('signup:1')).toBe(true);
        expect(limiter('signup:1')).toBe(true);
        expect(limiter('signup:1')).toBe(false);
    });
});
