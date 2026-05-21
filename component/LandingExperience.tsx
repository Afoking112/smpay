"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
    FiActivity,
    FiArrowRight,
    FiBarChart2,
    FiChevronDown,
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiDollarSign,
    FiEye,
    FiGift,
    FiGrid,
    FiLayers,
    FiLock,
    FiMenu,
    FiMessageCircle,
    FiShield,
    FiSmartphone,
    FiStar,
    FiTrendingUp,
    FiWifi,
    FiX,
    FiZap,
} from "react-icons/fi";

type Metric = {
    label: string;
    value: string;
    detail: string;
    icon: IconType;
};

type FeatureMode = {
    id: string;
    name: string;
    label: string;
    headline: string;
    body: string;
    bullets: string[];
    preview: Array<{ title: string; value: string; note: string }>;
    chips: string[];
    accent: string;
    icon: IconType;
};

type TrustBadge = {
    title: string;
    note: string;
    accent: string;
    icon: IconType;
};

type PhoneShowcase = {
    title: string;
    subtitle: string;
    accent: string;
    status: string;
    amount: string;
    detail: string;
    metrics: Array<{ label: string; value: string }>;
    actions: string[];
    footer: string;
};

type ProofCard = {
    title: string;
    eyebrow: string;
    body: string;
    accent: string;
    icon: IconType;
};

type FaqItem = {
    question: string;
    answer: string;
};

const topMetrics: Metric[] = [
    {
        label: "Service lanes",
        value: "6",
        detail: "Airtime, data, gift cards, airtime-to-cash, electricity, and cable in one front door.",
        icon: FiGrid,
    },
    {
        label: "Direct flows",
        value: "2",
        detail: "Airtime and data are framed as the fast wallet-backed actions.",
        icon: FiZap,
    },
    {
        label: "Visibility",
        value: "Live",
        detail: "Transactions and tracked requests stay visible instead of disappearing.",
        icon: FiEye,
    },
];

const featureModes: FeatureMode[] = [
    {
        id: "wallet",
        name: "Wallet Command",
        label: "Core dashboard flow",
        headline: "Fund once, then route every payment move from one command surface.",
        body: "The homepage now introduces SM PAY as a wallet-centered control panel instead of a basic stack of cards.",
        bullets: [
            "Wallet actions sit beside quick services.",
            "Transaction visibility stays close to checkout.",
            "The 3D hero mirrors the dashboard feel with layered payment surfaces.",
        ],
        preview: [
            { title: "Wallet actions", value: "Fund + Withdraw", note: "Balance control stays close to payment actions." },
            { title: "Activity view", value: "Searchable", note: "Service, status, and reference filters stay in reach." },
            { title: "Quick launch", value: "Always on", note: "No dead-end welcome screen before work starts." },
        ],
        chips: ["Wallet funding", "Withdraw flow", "Transaction filters"],
        accent: "#00d5ff",
        icon: FiDollarSign,
    },
    {
        id: "instant",
        name: "Instant Top-Ups",
        label: "Live wallet purchases",
        headline: "Turn airtime and data into the fastest path through the product.",
        body: "This mode leans into what already works immediately: network selection, plan picking, and wallet-backed checkout.",
        bullets: [
            "Airtime and data are positioned as real-time actions.",
            "The starter data catalog becomes a visible benefit.",
            "Quick action tiles reinforce speed before sign-in.",
        ],
        preview: [
            { title: "Top-up rails", value: "Airtime + Data", note: "Two instant purchase paths highlighted upfront." },
            { title: "Plan picker", value: "Catalog ready", note: "Users choose plans from a menu, not raw IDs." },
            { title: "Checkout feel", value: "Fast taps", note: "Built for repeat payments and quick re-entry." },
        ],
        chips: ["Network select", "Plan catalog", "Wallet debit preview"],
        accent: "#7df2c8",
        icon: FiWifi,
    },
    {
        id: "requests",
        name: "Tracked Requests",
        label: "Manual-review services",
        headline: "Make request-based services feel organized, transparent, and worth trusting.",
        body: "Electricity, cable TV, and airtime-to-cash are easier to trust when the landing page explains the tracking behind them.",
        bullets: [
            "Manual-review flows are positioned as tracked requests.",
            "Electricity, cable, and airtime-to-cash share one operational lane.",
            "Warmer accents signal review and follow-up instead of instant checkout.",
        ],
        preview: [
            { title: "Request types", value: "3 primary lanes", note: "Electricity, cable TV, and airtime-to-cash." },
            { title: "Status trail", value: "Visible history", note: "Pending, in review, completed, or declined." },
            { title: "Ops clarity", value: "No guesswork", note: "Provider, account, amount, and notes stay attached." },
        ],
        chips: ["Service history", "Manual review", "Status states"],
        accent: "#ffb347",
        icon: FiCreditCard,
    },
    {
        id: "support",
        name: "Support Thread",
        label: "Conversation-first help",
        headline: "Give gift card and support-heavy flows a clear human touchpoint.",
        body: "Some payment moments need a conversation, not another form. The new landing story makes room for that.",
        bullets: [
            "Gift card activity is introduced as a live support-led flow.",
            "The hero includes conversational cues so the app feels responsive.",
            "About and contact links sit in a stronger conversion path.",
        ],
        preview: [
            { title: "Gift card flow", value: "Live chat", note: "Support-led handling for higher-touch actions." },
            { title: "Escalation path", value: "Clear contact", note: "Users can move from landing to help without friction." },
            { title: "Admin visibility", value: "Alert-ready", note: "Conversations can surface for follow-up and review." },
        ],
        chips: ["Gift card chat", "Support path", "Ops follow-up"],
        accent: "#ff8f5a",
        icon: FiMessageCircle,
    },
];

const showcaseCards = [
    {
        title: "Quick service launcher",
        body: "The new landing page visually mirrors the dashboard's service grid so the product promise feels immediate.",
        accent: "#00d5ff",
        icon: FiLayers,
    },
    {
        title: "Data plan catalog",
        body: "Airtime and data are presented as guided checkout flows rather than generic buttons.",
        accent: "#7df2c8",
        icon: FiWifi,
    },
    {
        title: "Request status tracking",
        body: "Manual-review services are described with progress and visibility, not vague back-office handling.",
        accent: "#ffb347",
        icon: FiClock,
    },
    {
        title: "Searchable transaction view",
        body: "The landing page now advertises filtered history and status visibility as a real strength.",
        accent: "#ff8f5a",
        icon: FiBarChart2,
    },
];

const timeline = [
    {
        title: "Create and fund",
        body: "Move from signup into wallet funding with a clearer sense of what the balance unlocks next.",
    },
    {
        title: "Launch a service",
        body: "Instant top-ups and tracked requests are separated into understandable paths.",
    },
    {
        title: "Keep visibility",
        body: "Transactions, request history, and support-led actions roll back into one operating view.",
    },
];

const sceneTiles = [
    { label: "Wallet", group: "wallet" },
    { label: "Airtime", group: "instant" },
    { label: "Data", group: "instant" },
    { label: "Electricity", group: "requests" },
    { label: "Cable TV", group: "requests" },
    { label: "Gift Card", group: "support" },
];

const trustBadges: TrustBadge[] = [
    {
        title: "Wallet-backed speed",
        note: "Airtime and data can be framed as the fastest repeat-payment actions in the product.",
        accent: "#7df2c8",
        icon: FiZap,
    },
    {
        title: "Tracked operations",
        note: "Electricity, cable, and airtime-to-cash requests stay visible with clear status flow.",
        accent: "#ffb347",
        icon: FiClock,
    },
    {
        title: "Protected access",
        note: "Auth, wallet flows, and payment visibility now sit inside a more trustworthy presentation layer.",
        accent: "#00d5ff",
        icon: FiLock,
    },
    {
        title: "Human support path",
        note: "Gift card and support-led moments have a clear route instead of feeling hidden.",
        accent: "#ff8f5a",
        icon: FiMessageCircle,
    },
];

const phoneShowcases: PhoneShowcase[] = [
    {
        title: "Instant purchase mockup",
        subtitle: "Built around quick wallet actions",
        accent: "#7df2c8",
        status: "Live top-up",
        amount: "NGN 3,500",
        detail: "A tighter mobile story for airtime and data users who just want to fund, tap, and finish.",
        metrics: [
            { label: "Network", value: "MTN" },
            { label: "Plan", value: "2.5GB" },
            { label: "Checkout", value: "Wallet debit" },
        ],
        actions: ["Buy Airtime", "Buy Data", "View History"],
        footer: "Fast repeat-payment path for day-to-day users.",
    },
    {
        title: "Tracked request mockup",
        subtitle: "Made for services that need review",
        accent: "#ffb347",
        status: "In review",
        amount: "NGN 12,000",
        detail: "A clearer mobile preview for electricity, cable TV, and airtime-to-cash request visibility.",
        metrics: [
            { label: "Service", value: "Electricity" },
            { label: "Provider", value: "IKEDC" },
            { label: "Progress", value: "Visible status" },
        ],
        actions: ["Submit Request", "Track Status", "Add Notes"],
        footer: "Request-based flows feel organized, not uncertain.",
    },
];

const proofCards: ProofCard[] = [
    {
        title: "Repeat payments without tab-hopping",
        eyebrow: "Daily utility value",
        body: "SM PAY can now present itself as the place where users fund once and keep moving through airtime, data, and follow-up actions from one flow.",
        accent: "#7df2c8",
        icon: FiStar,
    },
    {
        title: "Operations users can actually follow",
        eyebrow: "Request clarity",
        body: "The landing page now explains that not every service is instant, and that tracked request history is a product strength rather than a hidden fallback.",
        accent: "#ffb347",
        icon: FiShield,
    },
    {
        title: "Support that feels part of the product",
        eyebrow: "Human touchpoint",
        body: "Gift card and support-led actions are presented honestly, giving users a clearer expectation of when a conversation is part of the journey.",
        accent: "#ff8f5a",
        icon: FiMessageCircle,
    },
];

const faqs: FaqItem[] = [
    {
        question: "What can users do right away on SM PAY?",
        answer: "Users can create an account, fund a wallet, buy airtime, buy data, and monitor activity from one interface.",
    },
    {
        question: "Are electricity and cable TV instant payments?",
        answer: "On the current product, those are better described as tracked request flows with visible status handling rather than instant automated checkout.",
    },
    {
        question: "How does gift card support work?",
        answer: "Gift card activity is presented as a support-led flow so users understand a conversation may be part of the process.",
    },
    {
        question: "Why does the landing page focus so much on visibility?",
        answer: "Because transaction history, service request tracking, and clear support routing are already strengths in the product and help build trust faster.",
    },
];

export default function LandingExperience() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeMode, setActiveMode] = useState<FeatureMode["id"]>("wallet");
    const [openFaq, setOpenFaq] = useState(0);
    const [tilt, setTilt] = useState({ x: -10, y: 14 });

    const activeFeature = featureModes.find((feature) => feature.id === activeMode) ?? featureModes[0];
    const ActiveIcon = activeFeature.icon;

    const handleSceneMove = (event: MouseEvent<HTMLDivElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;

        setTilt({
            x: Number((-vertical * 18).toFixed(2)),
            y: Number((horizontal * 22).toFixed(2)),
        });
    };

    const resetScene = () => {
        setTilt({ x: -10, y: 14 });
    };

    return (
        <main className="relative overflow-hidden bg-[#07111c] pb-28 text-[#f3f8ff] md:pb-0" style={{ fontFamily: "var(--font-body)" }}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="landing-blob left-[-9rem] top-[-7rem] h-[24rem] w-[24rem] bg-[#00d5ff]/18" />
                <div className="landing-blob right-[-6rem] top-[10rem] h-[22rem] w-[22rem] bg-[#7df2c8]/14" />
                <div className="landing-blob bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] bg-[#ff8f5a]/14" />
            </div>

            <section className="landing-grid relative">
                <div className="mx-auto max-w-7xl px-6 pb-20 pt-5 lg:px-8 lg:pb-28">
                    <header className="glass-panel reveal-up sticky top-4 z-40 rounded-full px-4 py-3 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <Link href="/" className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0d1a2b] text-sm font-semibold tracking-[0.24em] text-[#7df2c8] ring-1 ring-white/10">
                                    SM
                                </span>
                                <div>
                                    <p className="text-sm font-semibold tracking-[0.16em] text-white">SM PAY</p>
                                    <p className="text-xs text-[#94a8be]">Payments command center</p>
                                </div>
                            </Link>

                            <nav className="hidden items-center gap-7 text-sm text-[#a9b9ca] md:flex">
                                <Link href="#services" className="transition hover:text-white">
                                    Services
                                </Link>
                                <Link href="#features" className="transition hover:text-white">
                                    Features
                                </Link>
                                <Link href="/about" className="transition hover:text-white">
                                    About
                                </Link>
                                <Link href="/contact" className="transition hover:text-white">
                                    Contact
                                </Link>
                            </nav>

                            <div className="hidden items-center gap-3 md:flex">
                                <Link href="/login" className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-white/5">
                                    Log in
                                </Link>
                                <Link href="/signup" className="rounded-full bg-[#7df2c8] px-5 py-2.5 text-sm font-semibold text-[#07111c] transition hover:bg-[#97f7d4]">
                                    Create account
                                </Link>
                            </div>

                            <button
                                type="button"
                                aria-label={menuOpen ? "Close menu" : "Open menu"}
                                onClick={() => setMenuOpen((open) => !open)}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white md:hidden"
                            >
                                {menuOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
                            </button>
                        </div>

                        {menuOpen ? (
                            <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm text-[#d7e1ec] md:hidden">
                                <Link href="#services" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">
                                    Services
                                </Link>
                                <Link href="#features" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">
                                    Features
                                </Link>
                                <Link href="/about" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">
                                    About
                                </Link>
                                <Link href="/contact" onClick={() => setMenuOpen(false)} className="rounded-2xl px-2 py-2 hover:bg-white/5">
                                    Contact
                                </Link>
                                <div className="mt-2 flex flex-col gap-3">
                                    <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-full border border-white/12 px-4 py-3 text-center font-medium">
                                        Log in
                                    </Link>
                                    <Link href="/signup" onClick={() => setMenuOpen(false)} className="rounded-full bg-[#7df2c8] px-4 py-3 text-center font-semibold text-[#07111c]">
                                        Create account
                                    </Link>
                                </div>
                            </div>
                        ) : null}
                    </header>

                    <div className="grid gap-16 pt-12 lg:grid-cols-[1.03fr,0.97fr] lg:items-center lg:pt-16">
                        <div className="max-w-2xl reveal-up" style={{ animationDelay: "80ms" }}>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7df2c8]">
                                <FiActivity />
                                SM PAY 3D experience
                            </div>

                            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-display)" }}>
                                One wallet.
                                <br />
                                Six payment lanes.
                                <br />
                                <span className="bg-gradient-to-r from-[#7df2c8] via-[#00d5ff] to-[#f7d17a] bg-clip-text text-transparent">
                                    A homepage with depth.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-xl text-lg leading-8 text-[#b7c6d7]">
                                SM PAY now feels more like a payment command center than a brochure. The new landing page leans into layered 3D visuals, real product flows, stronger trust signals, and clearer conversion paths.
                            </p>

                            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                                <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7df2c8] px-7 py-4 text-base font-semibold text-[#07111c] transition hover:bg-[#97f7d4]">
                                    Start with SM PAY
                                    <FiArrowRight />
                                </Link>
                                <Link href="#services" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-7 py-4 text-base font-medium text-white transition hover:border-white/25 hover:bg-white/5">
                                    Explore the service radar
                                </Link>
                            </div>

                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                {topMetrics.map(({ label, value, detail, icon: Icon }) => (
                                    <article key={label} className="glass-panel rounded-[24px] p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-[#dce6f0]">{label}</p>
                                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-[#7df2c8]">
                                                <Icon />
                                            </span>
                                        </div>
                                        <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
                                        <p className="mt-3 text-sm leading-6 text-[#91a5bc]">{detail}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-[38rem] reveal-up [perspective:1800px]" style={{ animationDelay: "180ms" }}>
                            <div className="absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,_rgba(0,213,255,0.18),_transparent_62%)] blur-3xl" />
                            <div onMouseMove={handleSceneMove} onMouseLeave={resetScene} className="relative min-h-[33rem] sm:min-h-[38rem]">
                                <div className="scene-3d relative h-full transition-transform duration-300 ease-out" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
                                    <div className="glass-panel hero-shadow absolute inset-x-5 top-10 rounded-[30px] p-5 sm:inset-x-8">
                                        <div className="scene-3d relative rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,17,28,0.96),rgba(7,17,28,0.84))] p-6 sm:p-7">
                                            <div className="absolute right-5 top-5 flex gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#7df2c8]" />
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#00d5ff]" />
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#ffb347]" />
                                            </div>

                                            <div style={{ transform: "translateZ(70px)" }}>
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.24em] text-[#8aa0b7]">SM PAY command deck</p>
                                                        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                                                            Wallet meets workflow.
                                                        </h2>
                                                    </div>
                                                    <span className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ borderColor: `${activeFeature.accent}40`, backgroundColor: `${activeFeature.accent}16`, color: activeFeature.accent }}>
                                                        {activeFeature.label}
                                                    </span>
                                                </div>

                                                <div className="mt-7 grid gap-4 sm:grid-cols-[1.15fr,0.85fr]">
                                                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                                                        <p className="text-xs uppercase tracking-[0.2em] text-[#8aa0b7]">Preview balance</p>
                                                        <p className="mt-3 text-4xl font-semibold text-white sm:text-[2.8rem]" style={{ fontFamily: "var(--font-display)" }}>
                                                            NGN 48,500
                                                        </p>
                                                        <p className="mt-2 text-sm text-[#8da3ba]">Illustrative wallet state for the landing experience.</p>

                                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                                            {sceneTiles.map((tile) => {
                                                                const isActive = tile.group === activeFeature.id;
                                                                return (
                                                                    <div key={tile.label} className="rounded-2xl border px-3 py-3 text-sm transition-all duration-300" style={{ borderColor: isActive ? `${activeFeature.accent}55` : "rgba(255,255,255,0.08)", backgroundColor: isActive ? `${activeFeature.accent}18` : "rgba(255,255,255,0.03)", boxShadow: isActive ? `0 0 0 1px ${activeFeature.accent}25 inset` : "none" }}>
                                                                        <p className="font-medium text-white">{tile.label}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {activeFeature.preview.map((item) => (
                                                            <div key={item.title} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                                                                <p className="text-xs uppercase tracking-[0.18em] text-[#8aa0b7]">{item.title}</p>
                                                                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                                                                <p className="mt-2 text-sm leading-6 text-[#91a5bc]">{item.note}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                                    {activeFeature.chips.map((chip) => (
                                                        <div key={chip} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[#dce6f0]">
                                                            {chip}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-panel float-slow absolute left-0 top-6 hidden w-44 rounded-[24px] p-4 sm:block">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-white">Top-up rail</span>
                                            <FiTrendingUp className="text-[#7df2c8]" />
                                        </div>
                                        <p className="mt-3 text-2xl font-semibold text-white">Wallet ready</p>
                                        <p className="mt-2 text-sm leading-6 text-[#8ea4ba]">Funding and balance control stay close to service launch actions.</p>
                                    </div>

                                    <div className="glass-panel float-slow absolute bottom-12 right-0 hidden w-48 rounded-[24px] p-4 lg:block">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff8f5a]/16 text-[#ff8f5a]">
                                                <FiGift />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-white">Gift card thread</p>
                                                <p className="text-xs text-[#8ea4ba]">Support-led flow</p>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm leading-6 text-[#8ea4ba]">
                                            Some flows need a person, not another dropdown. The landing story makes room for that.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative -mt-6 pb-12 lg:-mt-10 lg:pb-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {trustBadges.map(({ title, note, accent, icon: Icon }, index) => (
                            <article
                                key={title}
                                className="glass-panel reveal-up rounded-[28px] p-5"
                                style={{ animationDelay: `${index * 90 + 120}ms` }}
                            >
                                <span
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl border"
                                    style={{
                                        borderColor: `${accent}40`,
                                        backgroundColor: `${accent}14`,
                                        color: accent,
                                    }}
                                >
                                    <Icon className="text-lg" />
                                </span>
                                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#9ab0c5]">{note}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="services" className="relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="max-w-2xl reveal-up">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7df2c8]">Service radar</p>
                        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
                            A landing page that explains how each lane works.
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-[#b7c6d7]">
                            Users can understand which services are instant, which are request-based, and where support fits before they ever create an account.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 lg:grid-cols-[0.44fr,0.56fr]">
                        <div className="grid gap-4">
                            {featureModes.map((feature) => {
                                const Icon = feature.icon;
                                const isActive = feature.id === activeFeature.id;

                                return (
                                    <button
                                        key={feature.id}
                                        type="button"
                                        onClick={() => setActiveMode(feature.id)}
                                        className="glass-panel rounded-[28px] p-5 text-left transition duration-300 hover:-translate-y-1"
                                        style={{
                                            borderColor: isActive ? `${feature.accent}55` : undefined,
                                            boxShadow: isActive ? `0 0 0 1px ${feature.accent}2d inset, 0 28px 60px rgba(0, 0, 0, 0.24)` : undefined,
                                            backgroundColor: isActive ? `${feature.accent}10` : undefined,
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <span className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ borderColor: `${feature.accent}40`, backgroundColor: `${feature.accent}14`, color: feature.accent }}>
                                                    <Icon className="text-lg" />
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{feature.name}</p>
                                                    <p className="mt-2 text-sm text-[#9ab0c5]">{feature.label}</p>
                                                </div>
                                            </div>
                                            {isActive ? (
                                                <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]" style={{ backgroundColor: `${feature.accent}18`, color: feature.accent }}>
                                                    Active
                                                </span>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <article className="glass-panel reveal-up rounded-[32px] p-7 sm:p-8" style={{ animationDelay: "120ms" }}>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-[22px] border" style={{ borderColor: `${activeFeature.accent}40`, backgroundColor: `${activeFeature.accent}14`, color: activeFeature.accent }}>
                                        <ActiveIcon className="text-2xl" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: activeFeature.accent }}>
                                            {activeFeature.label}
                                        </p>
                                        <h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white" style={{ fontFamily: "var(--font-display)" }}>
                                            {activeFeature.name}
                                        </h3>
                                    </div>
                                </div>

                                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/5">
                                    Try this flow
                                    <FiArrowRight />
                                </Link>
                            </div>

                            <h4 className="mt-8 text-3xl font-semibold leading-tight text-white">{activeFeature.headline}</h4>
                            <p className="mt-5 text-base leading-8 text-[#b7c6d7]">{activeFeature.body}</p>

                            <div className="mt-8 grid gap-3">
                                {activeFeature.bullets.map((bullet) => (
                                    <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                                        <FiCheckCircle className="mt-0.5 text-[#7df2c8]" />
                                        <p className="text-sm leading-7 text-[#dbe5ef]">{bullet}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 grid gap-4 md:grid-cols-3">
                                {activeFeature.preview.map((item) => (
                                    <div key={item.title} className="rounded-[24px] border border-white/10 bg-[#06101b]/80 p-4">
                                        <p className="text-xs uppercase tracking-[0.18em] text-[#8aa0b7]">{item.title}</p>
                                        <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                                        <p className="mt-3 text-sm leading-6 text-[#8ea4ba]">{item.note}</p>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section className="relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[0.42fr,0.58fr] lg:items-start">
                        <div className="reveal-up">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7df2c8]">Mobile mockups</p>
                            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
                                Phone-frame previews that make SM PAY feel like a real product, not just copy.
                            </h2>
                            <p className="mt-5 max-w-xl text-lg leading-8 text-[#b7c6d7]">
                                I used mock app frames instead of fake screenshots so the landing page stays honest while still showing what the wallet, top-up, and request flows are meant to feel like on mobile.
                            </p>

                            <div className="mt-8 grid gap-4">
                                {proofCards.map(({ title, eyebrow, body, accent, icon: Icon }, index) => (
                                    <article
                                        key={title}
                                        className="glass-panel reveal-up rounded-[28px] p-5"
                                        style={{ animationDelay: `${index * 90 + 100}ms` }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span
                                                className="flex h-12 w-12 items-center justify-center rounded-2xl border"
                                                style={{
                                                    borderColor: `${accent}40`,
                                                    backgroundColor: `${accent}14`,
                                                    color: accent,
                                                }}
                                            >
                                                <Icon className="text-lg" />
                                            </span>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>
                                                    {eyebrow}
                                                </p>
                                                <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
                                                <p className="mt-3 text-sm leading-7 text-[#9ab0c5]">{body}</p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {phoneShowcases.map((screen, index) => (
                                <article
                                    key={screen.title}
                                    className="glass-panel reveal-up rounded-[32px] p-4 sm:p-5"
                                    style={{ animationDelay: `${index * 120 + 160}ms` }}
                                >
                                    <div className="mx-auto max-w-[19rem] rounded-[2.4rem] border border-white/10 bg-[#040b14] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                                        <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(7,17,28,0.98),rgba(7,17,28,0.9))] p-4">
                                            <div className="mx-auto h-1.5 w-20 rounded-full bg-white/10" />

                                            <div className="mt-5 flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-[#8aa0b7]">{screen.subtitle}</p>
                                                    <h3 className="mt-2 text-lg font-semibold text-white">{screen.title}</h3>
                                                </div>
                                                <span
                                                    className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                                                    style={{
                                                        borderColor: `${screen.accent}40`,
                                                        backgroundColor: `${screen.accent}14`,
                                                        color: screen.accent,
                                                    }}
                                                >
                                                    {screen.status}
                                                </span>
                                            </div>

                                            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                                                <p className="text-xs uppercase tracking-[0.18em] text-[#8aa0b7]">Preview amount</p>
                                                <p className="mt-2 text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
                                                    {screen.amount}
                                                </p>
                                                <p className="mt-3 text-sm leading-6 text-[#8ea4ba]">{screen.detail}</p>
                                            </div>

                                            <div className="mt-4 grid gap-3">
                                                {screen.metrics.map((metric) => (
                                                    <div key={metric.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                                                        <span className="text-sm text-[#9ab0c5]">{metric.label}</span>
                                                        <span className="text-sm font-semibold text-white">{metric.value}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 grid grid-cols-3 gap-2">
                                                {screen.actions.map((action) => (
                                                    <div key={action} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-[#dce6f0]">
                                                        {action}
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-[#8aa0b7]">{screen.footer}</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[0.58fr,0.42fr]">
                        <div className="reveal-up">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f7d17a]">Great features</p>
                            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
                                The homepage now sells the real product depth.
                            </h2>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b7c6d7]">
                                Instead of generic marketing cards, the new sections highlight dashboard behavior that already exists in the app.
                            </p>

                            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                {showcaseCards.map(({ title, body, accent, icon: Icon }) => (
                                    <article key={title} className="glass-panel rounded-[28px] p-5">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}14`, color: accent }}>
                                            <Icon className="text-lg" />
                                        </span>
                                        <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-[#9ab0c5]">{body}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <article className="glass-panel reveal-up rounded-[32px] p-7 sm:p-8" style={{ animationDelay: "120ms" }}>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7df2c8]">Product rhythm</p>
                            <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white" style={{ fontFamily: "var(--font-display)" }}>
                                A clearer user journey from first click to ongoing visibility.
                            </h3>
                            <div className="mt-8 grid gap-5">
                                {timeline.map((step, index) => (
                                    <div key={step.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-sm font-semibold text-white">
                                                0{index + 1}
                                            </span>
                                            <p className="text-lg font-semibold text-white">{step.title}</p>
                                        </div>
                                        <p className="mt-4 text-sm leading-7 text-[#9ab0c5]">{step.body}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 rounded-[26px] border border-white/10 bg-[#0a1625] p-5">
                                <div className="flex items-start gap-4">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7df2c8]/16 text-[#7df2c8]">
                                        <FiShield />
                                    </span>
                                    <div>
                                        <p className="text-lg font-semibold text-white">Built for trust, not just polish.</p>
                                        <p className="mt-2 text-sm leading-7 text-[#9ab0c5]">
                                            Instant wallet services are separated from manual-review requests, and support-led flows are labeled clearly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section className="relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[0.4fr,0.6fr]">
                        <div className="reveal-up">
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f7d17a]">Trust and FAQ</p>
                            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
                                Extra confidence builders for first-time visitors.
                            </h2>
                            <p className="mt-5 max-w-xl text-lg leading-8 text-[#b7c6d7]">
                                This pass adds the practical questions people ask before signing up, along with a few product trust cues that keep the page grounded.
                            </p>

                            <div className="mt-8 space-y-4">
                                <div className="glass-panel reveal-up rounded-[28px] p-5" style={{ animationDelay: "100ms" }}>
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00d5ff]/14 text-[#00d5ff]">
                                            <FiShield />
                                        </span>
                                        <div>
                                            <p className="text-lg font-semibold text-white">Clear service expectations</p>
                                            <p className="mt-2 text-sm leading-7 text-[#9ab0c5]">
                                                The page now clearly separates instant wallet actions from request-based services so users know what happens next.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel reveal-up rounded-[28px] p-5" style={{ animationDelay: "180ms" }}>
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7df2c8]/14 text-[#7df2c8]">
                                            <FiSmartphone />
                                        </span>
                                        <div>
                                            <p className="text-lg font-semibold text-white">Mobile-first conversion path</p>
                                            <p className="mt-2 text-sm leading-7 text-[#9ab0c5]">
                                                The fixed mobile CTA keeps signup reachable while users scroll the page, which should help on smaller screens.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel reveal-up rounded-[32px] p-6 sm:p-8" style={{ animationDelay: "120ms" }}>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7df2c8]">Frequently asked</p>
                                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white" style={{ fontFamily: "var(--font-display)" }}>
                                        What new visitors usually want to know.
                                    </h3>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-3">
                                {faqs.map((item, index) => {
                                    const isOpen = openFaq === index;

                                    return (
                                        <article key={item.question} className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                                aria-expanded={isOpen}
                                                className="flex w-full items-center justify-between gap-4 text-left"
                                            >
                                                <span className="text-base font-semibold text-white">{item.question}</span>
                                                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#dce6f0] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                                                    <FiChevronDown />
                                                </span>
                                            </button>

                                            {isOpen ? (
                                                <p className="mt-4 pr-12 text-sm leading-7 text-[#9ab0c5]">{item.answer}</p>
                                            ) : null}
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative pb-16 pt-6 lg:pb-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="glass-panel reveal-up rounded-[36px] p-8 sm:p-10 lg:p-12">
                        <div className="grid gap-8 lg:grid-cols-[0.62fr,0.38fr] lg:items-end">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7df2c8]">Ready to launch</p>
                                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
                                    A stronger first impression for the whole SM PAY product.
                                </h2>
                                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b7c6d7]">
                                    The new landing page is designed to convert better, explain more, and feel memorable without inventing product capabilities that are not there.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7df2c8] px-7 py-4 text-base font-semibold text-[#07111c] transition hover:bg-[#97f7d4]">
                                    Create account
                                    <FiArrowRight />
                                </Link>
                                <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-7 py-4 text-base font-medium text-white transition hover:border-white/25 hover:bg-white/5">
                                    Contact support
                                </Link>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-8 text-sm text-[#8ea4ba] md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="font-semibold text-white">SM PAY</p>
                            <p className="mt-1">Wallet funding, top-ups, tracked requests, and payment visibility in one experience.</p>
                        </div>
                        <div className="flex flex-wrap gap-5">
                            <Link href="/about" className="transition hover:text-white">
                                About
                            </Link>
                            <Link href="/contact" className="transition hover:text-white">
                                Contact
                            </Link>
                            <Link href="/login" className="transition hover:text-white">
                                Log in
                            </Link>
                            <Link href="/signup" className="transition hover:text-white">
                                Sign up
                            </Link>
                        </div>
                    </footer>
                </div>
            </section>

            <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
                <div className="glass-panel reveal-up flex items-center gap-3 rounded-[24px] px-4 py-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7df2c8]">SM PAY</p>
                        <p className="truncate text-sm text-white">Create an account and start paying from one wallet.</p>
                    </div>
                    <Link href="/login" className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white">
                        Log in
                    </Link>
                    <Link href="/signup" className="rounded-full bg-[#7df2c8] px-4 py-2 text-sm font-semibold text-[#07111c]">
                        Sign up
                    </Link>
                </div>
            </div>
        </main>
    );
}
