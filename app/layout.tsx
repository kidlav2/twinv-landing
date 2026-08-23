import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Free stand-ins for the licensed Suisse Intl family, per the
   design system's own fallback list. Swap to next/font/local here
   if the studio ever licenses the real faces — nothing else changes. */
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const SITE = "https://vandv.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "V&V Studio — Websites that carry their weight",
    template: "%s | V&V Studio",
  },
  description:
    "A web design studio building and rebuilding sites that convert. Design, build, and growth for companies that outgrew their template.",
  openGraph: {
    title: "V&V Studio — Websites that carry their weight",
    description:
      "A web design studio building and rebuilding sites that convert.",
    url: SITE,
    siteName: "V&V Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "V&V Studio — Websites that carry their weight",
    description:
      "A web design studio building and rebuilding sites that convert.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="bg-canvas text-carbon min-h-full">{children}</body>
    </html>
  );
}
