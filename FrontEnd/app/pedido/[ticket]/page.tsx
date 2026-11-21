import OrderTicketPage from '../../../components/OrderTicketPage';

export default async function Page({ params }: { params: Promise<{ ticket: string }> }) {
  const { ticket } = await params;
  return <OrderTicketPage ticket={ticket} />;
}
