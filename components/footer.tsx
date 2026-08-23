import Link from "next/link";
import { footer, nav } from "@/lib/content";

export function Footer() {
  return (
    <footer className="pb-10 pt-section">
      <div className="shell">
        <div className="border-ash grid gap-12 border-t pt-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-heading leading-none">
              {nav.brand}
            </p>
            <p className="text-slate mt-5 max-w-[32ch] text-body-sm">
              {footer.blurb}
            </p>
            <a
              href={`mailto:${footer.email}`}
              className="bg-voltage text-carbon rounded-btn-sharp mt-6 inline-block px-2 py-1 text-body font-medium"
            >
              {footer.email}
            </a>
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-smoke font-mono text-caption uppercase">
                {col.title}
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-slate hover:text-carbon text-body-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-ash text-smoke mt-16 flex flex-col gap-4 border-t pt-6 text-caption sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {nav.brand}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {footer.legal.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-carbon transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
