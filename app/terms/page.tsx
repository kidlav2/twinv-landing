import type { Metadata } from "next";
import { legal } from "@/lib/content";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: legal.terms.title };

export default function TermsPage() {
  return <LegalPage doc={legal.terms} />;
}
