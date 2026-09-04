import type { ReactNode } from "react";
import { Nav } from "./nav";
import { BackToTop } from "./back-to-top";
import { SmoothScroll } from "./smooth-scroll";
import { Footer } from "./footer";
import { FooterZone } from "./footer-zone";

/**
 * The chrome every non-homepage route shares: fixed nav, ScrollSmoother, the
 * footer. Same nesting as app/page.tsx — Nav outside SmoothScroll for the
 * reason documented in smooth-scroll.tsx, Footer inside it as a sibling of
 * `main` so it participates in the same smoothed scroll as everything above.
 *
 * These pages may still use ScrollPanel or AboutStage for a dark zone; the
 * footer is a sibling of `main` either way so it stays the page footer.
 */
export function PageShell({
  children,
  flushFooter = false,
  footerCta = true,
  footerTone = "dark",
}: {
  children: ReactNode;
  /** Passed straight through to `Footer` — see the note on `cta` there. */
  footerCta?: boolean;
  /** Pass when the page's last block is full-bleed and should meet the
   *  footer's first rule directly, with no section-sized gap between them. */
  flushFooter?: boolean;
  /**
   * Paints the footer into a dark zone. Default is dark: DESIGN.md calls
   * the footer a compact dark band, whether the page above it is canvas or
   * carbon.
   *
   * The footer stays a sibling of `main` either way. Moving it inside a
   * dark `ScrollPanel` would have been the obvious way to get one continuous
   * black, but `ScrollPanel` renders a `<section>`, and a `<footer>` inside
   * sectioning content is that section's footer rather than the page's.
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
        <FooterZone dark={dark}>
          <Footer flush={flushFooter} cta={footerCta} />
        </FooterZone>
      </SmoothScroll>
    </>
  );
}
