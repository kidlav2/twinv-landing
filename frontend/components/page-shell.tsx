import type { ReactNode } from "react";
import { Nav } from "./nav";
import { BackToTop } from "./back-to-top";
import { SmoothScroll } from "./smooth-scroll";
import { Footer } from "./footer";

/**
 * The chrome every non-homepage route shares: fixed nav, ScrollSmoother, the
 * footer. Same nesting as app/page.tsx — Nav outside SmoothScroll for the
 * reason documented in smooth-scroll.tsx, Footer inside it as a sibling of
 * `main` so it participates in the same smoothed scroll as everything above.
 *
 * These pages don't use ScrollPanel — there's no dark zone to arrive at, so
 * the default `:root` / `.tone-light` role values apply without it, and the
 * page just sits on canvas.
 */
export function PageShell({
  children,
  flushFooter = false,
  footerTone = "light",
}: {
  children: ReactNode;
  /** Pass when the page's last block is full-bleed and should meet the
   *  footer's first rule directly, with no section-sized gap between them. */
  flushFooter?: boolean;
  /**
   * Paints the footer into a dark zone, for a page whose last panel is the
   * black one — the footer then continues that black rather than dropping the
   * page back to canvas for its last screen.
   *
   * The footer stays a sibling of `main` either way. Moving it inside the
   * dark `ScrollPanel` would have been the obvious way to get one continuous
   * black, but `ScrollPanel` renders a `<section>`, and a `<footer>` inside
   * sectioning content is that section's footer rather than the page's.
   * Painting the same black here keeps the black unbroken and the document
   * outline intact — and the panel's `terminal` mode holds the nav dark all
   * the way down, so the two read as one zone.
   */
  footerTone?: "light" | "dark";
}) {
  const dark = footerTone === "dark";

  return (
    <>
      <Nav />
      <BackToTop />
      <SmoothScroll>
        <main>{children}</main>
        <div className={dark ? "tone-dark bg-carbon" : ""}>
          <Footer flush={flushFooter} />
        </div>
      </SmoothScroll>
    </>
  );
}
