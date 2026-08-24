import Link from "next/link";
import { footer, nav } from "@/lib/content";

/**
 * Mobile and desktop are two different arrangements here, not one grid
 * reflowing. Measured before this rewrite: at 375px the four-block grid
 * collapsed into a single left-aligned column that ran 1130px tall — every
 * link, left-shifted under the next, reading as unfinished rather than
 * restrained. Below `lg` this now shows only the brand block and Connect,
 * centred; Services and Studio (nine links between them, all restatements of
 * the nav and the services grid already on the homepage) come back at `lg`
 * alongside the original left-aligned four-column layout, untouched.
 */
export function Footer() {
  const [servicesCol, studioCol, connectCol] = footer.columns;

  return (
    <footer className="pt-section pb-8 sm:pb-10">
      <div className="shell">
        <div className="border-ash grid grid-cols-1 justify-items-center gap-y-10 border-t pt-8 text-center lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:justify-items-start lg:gap-x-8 lg:gap-y-12 lg:pt-12 lg:text-left">
          <div>
            {/* Same mask as the nav, painted `text-carbon` because the footer
                sits in the light zone. `mx-auto` centres it below `lg` — a
                masked span is a block box, not text, so `text-center` on the
                container doesn't reach it on its own. */}
            <span
              className="brand-mark text-carbon mx-auto h-10 sm:h-12 lg:mx-0"
              role="img"
              aria-label={nav.brand}
            />
            <p className="text-slate mx-auto mt-4 max-w-[32ch] text-body-sm sm:mt-5 lg:mx-0">
              {footer.blurb}
            </p>
            <a
              href={`mailto:${footer.email}`}
              className="bg-voltage text-carbon rounded-btn-sharp mt-5 inline-block px-2 py-1 text-body font-medium sm:mt-6"
            >
              {footer.email}
            </a>
          </div>

          {/* Services and Studio: nine links that are every nav item and
              every service card restated as a footer list. Real estate a
              phone screen doesn't have to spend on a restatement. */}
          {[servicesCol, studioCol].map((col) => (
            <div key={col.title} className="hidden lg:block">
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

          <div>
            <p className="text-smoke font-mono text-caption uppercase">
              {connectCol.title}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
              {connectCol.links.map((l) => (
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
        </div>

        <div className="border-ash text-smoke mt-10 flex flex-col items-center gap-4 border-t pt-6 text-center text-caption lg:mt-16 lg:flex-row lg:items-center lg:justify-between lg:text-left">
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
