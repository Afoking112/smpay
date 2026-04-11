import PaymentSuccessClient from './PaymentSuccessClient';

export default async function PaymentSuccessPage({ searchParams }) {
    const params = await searchParams;

    return <PaymentSuccessClient reference={params?.ref || ''} />;
}
