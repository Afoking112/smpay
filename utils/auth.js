const listeners = new Set();

function notifyAuthListeners() {
    listeners.forEach((listener) => listener());
}

export function getStoredToken() {
    if (typeof window === 'undefined') {
        return '';
    }

    return localStorage.getItem('token') || '';
}

export function subscribeToAuthToken(listener) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    listeners.add(listener);
    window.addEventListener('storage', listener);

    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

export function storeAuthSession(token) {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem('token', token);
    document.cookie = `token=${token}; path=/; max-age=604800`;
    notifyAuthListeners();
}

export function clearAuthSession() {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';
    notifyAuthListeners();
}
