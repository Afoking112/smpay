import PaymentFailedClient from './PaymentFailedClient';

export default async function PaymentFailedPage({ searchParams }) {
    const params = await searchParams;

    return <PaymentFailedClient reference={params?.ref || ''} />;
}
