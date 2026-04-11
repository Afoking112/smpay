export function getStoredToken() {
    if (typeof window === 'undefined') {
        return '';
    }

    return localStorage.getItem('token') || '';
}

export function clearAuthSession() {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';
}
