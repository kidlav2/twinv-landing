import type { ReactNode } from "react";
import { Nav } from "./nav";
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
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <SmoothScroll>
        <main>{children}</main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
