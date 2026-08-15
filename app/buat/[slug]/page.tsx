import Builder from "@/components/builder/Builder";
import { getTemplate } from "@/lib/templates";

export const metadata = {
  title: "Buat Ucapan",
  description: "Buat website ucapan personal untuk pacar kamu dalam 5 menit.",
};

export default async function BuilderRoute({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { slug } = await params;
  const { edit } = await searchParams;
  if (!getTemplate(slug)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return <Builder slug={slug} editId={edit} />;
}
