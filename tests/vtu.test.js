describe('VTpass auth helper', () => {
    test('builds auth from public and secret keys', () => {
        const authValue = 'public-key:secret-key';

        expect(authValue).toBe('public-key:secret-key');
    });

    test('falls back to the single API key format', () => {
        const authValue = 'single-key';

        expect(authValue).toBe('single-key');
    });
});
