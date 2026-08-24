"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Fixed bottom-right jump to `#top`. A plain `<Link href="/#top">` — the
 * delegated click handler in smooth-scroll.tsx already owns smoothing the
 * scroll (and, from a subpage, routing home first), so this is not a second
 * scroll implementation.
 *
 * MUST render next to `<Nav />`, OUTSIDE `<SmoothScroll>` — same reason the
 * nav itself has to: ScrollSmoother's content wrapper is transformed, and a
 * transformed ancestor becomes the containing block for `position: fixed`,
 * so this would scroll away with the page from inside it.
 *
 * Colour comes from the same `--nav-cta-*` variables the nav's own CTA
 * reads, so it flips light/dark with `data-nav-tone` for free instead of
 * introducing a fourth accent colour.
 *
 * Visibility is a plain attribute write off two ScrollTriggers, not a tween
 * or React state — same call as the nav-tone trigger in scroll-panel.tsx: it
 * has to run regardless of prefers-reduced-motion, and CSS owns the actual
 * (short, non-essential) fade.
 *   - `past` flips once the page has scrolled roughly a viewport down.
 *     Numeric `start`/no `trigger` keeps this page-agnostic — it doesn't
 *     depend on the homepage hero's `#top` id existing on every route.
 *   - `overFooter` flips while the footer is on screen, so the button is
 *     never sitting on top of the footer's own bottom-right content.
 */
export function BackToTop() {
  const ref = useRef<HTMLAnchorElement>(null);
  const past = useRef(false);
  const overFooter = useRef(false);

  useGSAP(() => {
    const sync = () => {
      const el = ref.current;
      if (!el) return;
      el.dataset.visible = String(past.current && !overFooter.current);
    };

    const pastTrigger = ScrollTrigger.create({
      start: () => `${window.innerHeight} top`,
      end: "max",
      onToggle: ({ isActive }) => {
        past.current = isActive;
        sync();
      },
    });

    const footerTrigger = ScrollTrigger.create({
      trigger: "footer",
      start: "top bottom",
      end: "bottom bottom",
      onToggle: ({ isActive }) => {
        overFooter.current = isActive;
        sync();
      },
    });

    return () => {
      pastTrigger.kill();
      footerTrigger.kill();
    };
  }, {});

  return (
    <Link
      ref={ref}
      href="/#top"
      aria-label="Back to top"
      className="back-to-top fixed bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full sm:bottom-8"
      style={{ insetInlineEnd: "var(--nav-padding)" }}
    >
      <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
