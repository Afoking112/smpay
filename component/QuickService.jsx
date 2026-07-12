import {
    FiPhone,
    FiWifi,
    FiZap,
    FiDollarSign,
    FiCreditCard,
    FiBriefcase,
    FiTv,
} from "react-icons/fi";

const serviceCards = [
    { id: 'airtime', title: 'Buy Airtime', icon: FiPhone, enabled: true },
    { id: 'data', title: 'Buy Data', icon: FiWifi, enabled: true },
    { id: 'gift-card', title: 'Gift Cards', icon: FiZap, enabled: true },
    { id: 'airtime-cash', title: 'Airtime to Cash', icon: FiDollarSign, enabled: true },
    { id: 'electricity', title: 'Electricity Bills', icon: FiCreditCard, enabled: true },
    { id: 'cable-tv', title: 'Cable TV', icon: FiTv, enabled: true },
    { id: 'loan', title: 'Loan', icon: FiBriefcase, enabled: true },
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
                        className={`group rounded-[1.5rem] p-6 text-left transition-all duration-200 ${
                            enabled
                                ? isActive
                                    ? 'app-card-hero text-white shadow-lg'
                                    : 'app-card-soft text-white hover:-translate-y-1'
                                : 'app-card-soft cursor-not-allowed text-[#60748b]'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <Icon className={`text-2xl ${isActive ? 'text-white' : 'text-[#7df2c8]'}`} />
                            {!enabled ? (
                                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-xs font-medium text-[#8ea4ba]">
                                    Soon
                                </span>
                            ) : null}
                        </div>
                        <p className="mt-4 font-medium text-white">{title}</p>
                    </button>
                );
            })}
        </div>
    );
}
