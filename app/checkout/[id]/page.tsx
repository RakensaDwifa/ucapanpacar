import Checkout from "@/components/checkout/Checkout";

export const metadata = {
  title: "Pembayaran",
  description: "Selesaikan pembayaran untuk mengaktifkan ucapanmu.",
};

export default async function CheckoutRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Checkout id={id} />;
}
