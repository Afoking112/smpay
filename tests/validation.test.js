const {
    validateRequiredEnv,
    isValidEmail,
    sanitizeAmount,
    validateSignupInput,
    validateAmount,
    validateAdminRole,
} = require('../utils/validation.js');

describe('validation helpers', () => {
    test('flags missing environment keys', () => {
        const result = validateRequiredEnv(['JWT_SECRET', 'MONGODB_URI'], { JWT_SECRET: 'abc' });

        expect(result.ok).toBe(false);
        expect(result.missingKeys).toEqual(['MONGODB_URI']);
    });

    test('accepts valid emails', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail(' invalid@Example.com ')).toBe(true);
        expect(isValidEmail('not-an-email')).toBe(false);
    });

    test('sanitizes positive amounts', () => {
        expect(sanitizeAmount('100.005')).toBe(100.01);
        expect(sanitizeAmount('0')).toBeNull();
        expect(sanitizeAmount('abc')).toBeNull();
    });

    test('validates signup input', () => {
        const result = validateSignupInput({
            name: ' Ada ',
            phone: '08012345678',
            email: ' user@example.com ',
            password: 'secret123',
        });

        expect(result.ok).toBe(true);
        expect(result.normalized).toEqual({
            name: 'Ada',
            phone: '08012345678',
            email: 'user@example.com',
            password: 'secret123',
        });
    });

    test('rejects invalid signup input', () => {
        const result = validateSignupInput({
            name: 'Ada',
            phone: '08012345678',
            email: 'not-an-email',
            password: '123',
        });

        expect(result.ok).toBe(false);
        expect(result.error).toMatch(/valid email|at least 6 characters/i);
    });

    test('sanitizes and validates amounts', () => {
        const valid = validateAmount('50.005', 'Funding amount');
        const invalid = validateAmount('0', 'Funding amount');

        expect(valid.ok).toBe(true);
        expect(valid.amount).toBe(50.01);
        expect(invalid.ok).toBe(false);
        expect(invalid.error).toBe('Funding amount must be greater than zero');
    });

    test('normalizes admin roles', () => {
        expect(validateAdminRole('admin')).toBe('admin');
        expect(validateAdminRole('super')).toBe('user');
    });
});
