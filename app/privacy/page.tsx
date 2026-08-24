import type { Metadata } from "next";
import { legal } from "@/lib/content";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: legal.privacy.title };

export default function PrivacyPage() {
  return <LegalPage doc={legal.privacy} />;
}
