const currencyFormatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
});

export function formatCurrency(amount = 0) {
    return currencyFormatter.format(Number(amount) || 0);
}
