import Link from "next/link";
import { footer, nav } from "@/lib/content";

/**
 * Measured before this rewrite: at 375px the old single-column stack of
 * brand block + three link columns ran 1130px tall — 1.4 screens of nothing
 * but footer. The fix isn't hiding content, it's letting the three link
 * columns sit two-up instead of one-under-another, and trimming the gaps
 * that were sized for a desktop row instead of a phone column.
 */
export function Footer() {
  return (
    <footer className="pt-section pb-8 sm:pb-10">
      <div className="shell">
        <div className="border-ash grid grid-cols-2 gap-x-6 gap-y-10 border-t pt-8 sm:gap-x-8 sm:gap-y-12 sm:pt-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Spans both mobile columns — it carries the mark, the blurb and
              the email, which is more than a link list should share a row
              with even at phone width. */}
          <div className="col-span-2 lg:col-span-1">
            {/* Same mask as the nav, painted `text-carbon` because the footer
                sits in the light zone. */}
            <span
              className="brand-mark text-carbon h-10 sm:h-12"
              role="img"
              aria-label={nav.brand}
            />
            <p className="text-slate mt-4 max-w-[32ch] text-body-sm sm:mt-5">
              {footer.blurb}
            </p>
            <a
              href={`mailto:${footer.email}`}
              className="bg-voltage text-carbon rounded-btn-sharp mt-5 inline-block px-2 py-1 text-body font-medium sm:mt-6"
            >
              {footer.email}
            </a>
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-smoke font-mono text-caption uppercase">
                {col.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
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

        <div className="border-ash text-smoke mt-10 flex flex-col gap-4 border-t pt-6 text-caption sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {nav.brand}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {footer.legal.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="hover:text-carbon transition-colors"
                >
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
