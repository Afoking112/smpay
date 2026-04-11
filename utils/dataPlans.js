export const DATA_PLAN_CATALOG = {
    MTN: [
        { id: 'mtn-500mb-30d', providerPlanId: 'mtn-500mb-30d', label: '500MB - 30 Days', amount: 500 },
        { id: 'mtn-1gb-30d', providerPlanId: 'mtn-1gb-30d', label: '1GB - 30 Days', amount: 1000 },
        { id: 'mtn-2gb-30d', providerPlanId: 'mtn-2gb-30d', label: '2GB - 30 Days', amount: 2000 },
    ],
    GLO: [
        { id: 'glo-500mb-14d', providerPlanId: 'glo-500mb-14d', label: '500MB - 14 Days', amount: 500 },
        { id: 'glo-1_35gb-14d', providerPlanId: 'glo-1_35gb-14d', label: '1.35GB - 14 Days', amount: 1000 },
        { id: 'glo-2_9gb-30d', providerPlanId: 'glo-2_9gb-30d', label: '2.9GB - 30 Days', amount: 2000 },
    ],
    AIRTEL: [
        { id: 'airtel-750mb-14d', providerPlanId: 'airtel-750mb-14d', label: '750MB - 14 Days', amount: 500 },
        { id: 'airtel-1_5gb-30d', providerPlanId: 'airtel-1_5gb-30d', label: '1.5GB - 30 Days', amount: 1000 },
        { id: 'airtel-3gb-30d', providerPlanId: 'airtel-3gb-30d', label: '3GB - 30 Days', amount: 1500 },
    ],
    '9MOBILE': [
        { id: '9mobile-500mb-30d', providerPlanId: '9mobile-500mb-30d', label: '500MB - 30 Days', amount: 500 },
        { id: '9mobile-1_5gb-30d', providerPlanId: '9mobile-1_5gb-30d', label: '1.5GB - 30 Days', amount: 1200 },
        { id: '9mobile-3gb-30d', providerPlanId: '9mobile-3gb-30d', label: '3GB - 30 Days', amount: 1800 },
    ],
};

export function getDataPlansForNetwork(network = 'MTN') {
    return DATA_PLAN_CATALOG[network] || [];
}
