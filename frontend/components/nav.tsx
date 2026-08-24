"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { nav } from "@/lib/content";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /**
   * Only real routes can be "current". The other four links are homepage
   * anchors (`/#process`), and a section scrolled into view is not a page you
   * are on — marking one would put two current items in the bar at once.
   * Compared against the path only, so a trailing hash never breaks the match.
   */
  const isCurrent = (href: string) => !href.includes("#") && href === pathname;

  // Don't let the page scroll behind the open mobile sheet.
  //
  // Must target documentElement, not body: ScrollSmoother gives body an
  // explicit pixel height and the document scroller becomes html, so
  // `body { overflow: hidden }` no longer stops anything. Pausing the smoother
  // covers the transform-driven scrolling it does on top of that.
  useEffect(() => {
    const smoother = ScrollSmoother.get();
    document.documentElement.style.overflow = open ? "hidden" : "";
    smoother?.paused(open);
    return () => {
      document.documentElement.style.overflow = "";
      ScrollSmoother.get()?.paused(false);
    };
  }, [open]);

  return (
    <header className="nav-bar fixed inset-x-0 top-0 z-50">
      <div
        className="flex items-center justify-between gap-6 py-6"
        style={{ paddingInline: "var(--nav-padding)" }}
      >
        {/* Height is capped deliberately. `--nav-height` is the single source
            for the bar height and is read by smooth-scroll.tsx (anchor offset),
            scroll-panel.tsx (nav-tone trigger) and globals.css
            (scroll-margin-top). The bar is as tall as its tallest child, which
            is the link pill at ~64px — keeping the mark under that means the
            token does not move. Measured after this change: bar 113px against
            a token of 113px. */}
        {/* "/#top" not "#top" — same reason nav.links moved to /#id in
            content.ts: the nav renders on every route, and a bare hash only
            resolves against whatever page is currently mounted. */}
        <Link
          href="/#top"
          aria-label={nav.brand}
          className="nav-brand inline-flex shrink-0 items-center"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark h-9 sm:h-11" aria-hidden />
        </Link>

        <nav className="nav-pill rounded-pill hidden items-center gap-10 px-10 py-5 lg:flex">
          <ul className="nav-links flex items-center gap-10">
            {nav.links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  className="nav-link text-sub-lg font-medium"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {/* The brief form reads this attribute on click and preselects the
              matching option — see components/brief.tsx. The href stays a
              plain anchor so the smooth-scroll handler still owns the scroll. */}
          <Link
            href={nav.cta.href}
            data-brief-goal="demo"
            className="nav-cta hidden rounded-[14px] px-7 py-4 text-sub-lg font-semibold sm:inline-flex"
          >
            {nav.cta.label}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="nav-burger rounded-btn flex h-12 w-12 items-center justify-center border lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 block h-[1.5px] w-full transition-transform duration-200 ${
                  open ? "top-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full transition-transform duration-200 ${
                  open ? "top-1/2 -rotate-45" : "top-full"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          className="nav-pill mx-auto mb-4 overflow-hidden rounded-2xl lg:hidden"
          style={{ marginInline: "var(--nav-padding)" }}
        >
          <ul className="flex flex-col p-4">
            {nav.links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  className="nav-link block rounded-btn px-4 py-4 text-heading-sm"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href={nav.cta.href}
                onClick={() => setOpen(false)}
                className="nav-cta block rounded-[14px] px-6 py-4 text-center text-body font-medium"
              >
                {nav.cta.label}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
