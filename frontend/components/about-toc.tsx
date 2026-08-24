import Link from "next/link";
import { about } from "@/lib/content";

/**
 * The page's contents, as a masthead rail beside the title.
 *
 * Server component on purpose: these are ordinary in-page anchors, and the
 * delegated capture-phase handler in smooth-scroll.tsx already turns any
 * `#id` click into a tweened scroll. A second scroll implementation here
 * would fight it.
 *
 * Bare `#id`, not `/#id`: unlike the nav and footer — which render on every
 * route — this only ever renders on /about, and its targets are on this same
 * page. That is exactly the distinction content.ts documents for the two
 * anchor shapes.
 *
 * No `01 / 02 / 03`. A table of contents is a set of destinations, not a
 * sequence, so a number would encode an order the reader does not need —
 * and index badges are the generic-template pattern AGENTS.md removed from
 * Problem/Pillars/Services and says not to reintroduce.
 */
export function AboutToc() {
  return (
    <nav aria-label="On this page" className="border-line border-t">
      <ul>
        {about.toc.map((item) => (
          <li key={item.href} className="border-line border-b">
            <Link
              href={item.href}
              className="group text-fg hover:text-fg flex items-center justify-between gap-6 py-5 transition-colors"
            >
              <span className="font-mono text-caption uppercase">
                {item.label}
              </span>
              {/* A solid wedge, not a hairline arrow with a stem. The thin
                  stroked glyph is what read as generic on the service pages;
                  this is a filled shape at the same weight as the type it
                  sits beside, and it is vertically centred rather than
                  hanging below the baseline. */}
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className="text-faint group-hover:text-fg h-3 w-3 shrink-0 transition-colors"
              >
                <path d="M6 11 0.8 2h10.4z" fill="currentColor" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
