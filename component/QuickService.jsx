import {
    FiPhone,
    FiWifi,
    FiZap,
    FiDollarSign,
    FiCreditCard,
    FiTv,
} from "react-icons/fi";

const serviceCards = [
    { id: 'airtime', title: 'Buy Airtime', icon: FiPhone, enabled: true },
    { id: 'data', title: 'Buy Data', icon: FiWifi, enabled: true },
    { id: 'gift-card', title: 'Gift Cards', icon: FiZap, enabled: true },
    { id: 'airtime-cash', title: 'Airtime to Cash', icon: FiDollarSign, enabled: true },
    { id: 'electricity', title: 'Electricity Bills', icon: FiCreditCard, enabled: true },
    { id: 'cable-tv', title: 'Cable TV', icon: FiTv, enabled: true },
];

export default function QuickServices({ selectedService, onSelectService }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
            {serviceCards.map(({ id, title, icon: Icon, enabled }) => {
                const isActive = selectedService === id;

                return (
                    <button
                        key={id}
                        type="button"
                        disabled={!enabled}
                        onClick={() => enabled && onSelectService?.(id)}
                        className={`group rounded-xl p-6 text-left shadow transition-all duration-200 ${
                            enabled
                                ? isActive
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white hover:-translate-y-1 hover:shadow-lg'
                                : 'bg-white/70 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <Icon className={`text-2xl ${isActive ? 'text-white' : 'text-blue-600'}`} />
                            {!enabled ? (
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                                    Soon
                                </span>
                            ) : null}
                        </div>
                        <p className="mt-4 font-medium">{title}</p>
                    </button>
                );
            })}
        </div>
    );
}
