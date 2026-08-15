import Success from "@/components/checkout/Success";

export const metadata = {
  title: "Pembayaran Berhasil",
  description: "Kejutanmu sudah aktif. Bagikan sekarang!",
};

export default async function SuccessRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Success id={id} />;
}
