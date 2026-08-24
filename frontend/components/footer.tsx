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
 *
 * Colours are tone-aware ROLES (text-fg / text-muted / text-faint /
 * border-line), not fixed palette names, so this renders correctly inside a
 * `.tone-dark` zone — which the service pages now put it in. In the light zone
 * every role resolves to exactly the value that was hard-coded before
 * (muted = #444 = slate, faint = #979797 = smoke, line = #c6c6c6 = ash), so
 * nothing about the existing pages moved. The one deliberate exception is the
 * voltage email chip: yellow-on-black reads in both tones, so it stays fixed.
 *
 * `flush` drops the top padding so a full-bleed block immediately above (the
 * prev/next pager on a service page) sits directly against the footer's first
 * rule instead of floating over a section-sized gap.
 */
export function Footer({ flush = false }: { flush?: boolean }) {
  const [servicesCol, studioCol, connectCol] = footer.columns;

  return (
    <footer className={`${flush ? "" : "pt-section"} pb-8 sm:pb-10`}>
      {/* Full-bleed rules. The border lives on its own element OUTSIDE
          `.shell`, so it runs edge to edge while the content below keeps the
          gutter. Previously `border-t` sat on the shell-padded grid itself,
          which inset the line by --shell-padding — up to 96px of visible gap
          at each end on a wide screen. */}
      <div className="border-line border-t" />

      <div className="shell pt-8 lg:pt-12">
        <div className="grid grid-cols-1 justify-items-center gap-y-10 text-center lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:justify-items-start lg:gap-x-8 lg:gap-y-12 lg:text-left">
          <div>
            {/* Same mask as the nav. The mask is painted with `currentColor`,
                so `text-fg` makes the wordmark follow the zone — black on
                canvas, white on carbon — from one file, with no second
                request on the flip. `mx-auto` centres it below `lg`: a masked
                span is a block box, not text, so `text-center` on the
                container doesn't reach it on its own. */}
            <span
              className="brand-mark text-fg mx-auto h-10 sm:h-12 lg:mx-0"
              role="img"
              aria-label={nav.brand}
            />
            <p className="text-muted mx-auto mt-4 max-w-[32ch] text-body-sm sm:mt-5 lg:mx-0">
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
              <p className="text-faint font-mono text-caption uppercase">
                {col.title}
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-muted hover:text-fg text-body-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-faint font-mono text-caption uppercase">
              {connectCol.title}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 sm:mt-5 sm:gap-3">
              {connectCol.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-muted hover:text-fg text-body-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-line mt-10 border-t lg:mt-16" />

      <div className="shell pt-6">
        <div className="text-faint flex flex-col items-center gap-4 text-center text-caption lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p>
            © {new Date().getFullYear()} {nav.brand}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {footer.legal.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="hover:text-fg transition-colors"
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
