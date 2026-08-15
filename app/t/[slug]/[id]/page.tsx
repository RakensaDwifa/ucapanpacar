import PublicView from "@/components/view/PublicView";

export const metadata = {
  title: "Sebuah Ucapan Untukmu",
  description: "Seseorang membuatkan ucapan spesial untukmu.",
};

export default async function ViewRoute({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id } = await params;
  return <PublicView id={id} />;
}
