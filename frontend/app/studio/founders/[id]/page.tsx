import { notFound } from "next/navigation";
import { FounderView } from "@/components/studio/founder-view";

export default async function FounderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id !== "a" && id !== "b") notFound();
  return <FounderView id={id} />;
}
