import type { Metadata } from "next";
import { StudioShell } from "@/components/studio/shell";

export const metadata: Metadata = {
  title: "Admin",
  description: "Internal Twin V Studio finance and project control center.",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
