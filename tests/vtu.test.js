const { getVtpassAuthValue, normalizeProviderError } = require('../services/vtu.js');

describe('VTpass auth helper', () => {
    test('prefers public and secret keys when both formats are available', () => {
        const env = {
            VTPASS_API_KEY: 'single-key',
            VTPASS_PUBLIC_KEY: 'public-key',
            VTPASS_SECRET_KEY: 'secret-key',
        };

        expect(getVtpassAuthValue(env)).toBe('public-key:secret-key');
    });

    test('falls back to the single API key format', () => {
        const env = {
            VTPASS_API_KEY: 'single-key',
        };

        expect(getVtpassAuthValue(env)).toBe('single-key');
    });
});

describe('VTpass error normalization', () => {
    test('returns the provider response body when available', () => {
        const error = {
            response: {
                status: 401,
                data: {
                    response_description: 'Invalid credentials',
                },
            },
        };

        expect(normalizeProviderError(error)).toContain('Invalid credentials');
    });

    test('falls back to the axios message when no provider body exists', () => {
        const error = {
            message: 'Request failed with status code 401',
        };

        expect(normalizeProviderError(error)).toBe('Request failed with status code 401');
    });
});
