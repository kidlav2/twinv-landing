"use client";

import { useEffect, useState } from "react";

/**
 * The sticky section rail beside a legal document.
 *
 * `position: sticky` rather than `fixed` on purpose — the rail lives inside
 * `#smooth-content`, which ScrollSmoother transforms, and a transformed
 * ancestor becomes the containing block for `fixed` (the same reason `<Nav />`
 * has to sit outside `<SmoothScroll>`). `sticky` is unaffected by that.
 *
 * Active tracking is a plain IntersectionObserver, not ScrollTrigger: there is
 * no tween here, only a class swap, and the observer reads real post-transform
 * geometry so the smoothed scroll costs it nothing. The `rootMargin` pins the
 * activation line just under the nav, so the highlighted item is the section
 * whose heading you can actually see.
 *
 * Anchors are ordinary `<a href="#id">`. `smooth-scroll.tsx` delegates in-page
 * anchor clicks, and `scroll-margin-top` in globals.css keeps the heading clear
 * of the fixed bar — do not add `scroll-behavior: smooth` to make this work.
 */
export function LegalToc({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (hit) setActive(hit.target.id);
      },
      {
        /* Top edge sits below the nav; bottom edge high enough that the last
           short section still wins before the footer arrives. */
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0,
      },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="flex flex-col gap-1">
      <p className="text-faint mb-3 font-mono text-caption uppercase">
        On this page
      </p>
      {sections.map((s, i) => {
        const on = s.id === active;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? "true" : undefined}
            className={`group flex items-baseline gap-3 py-1.5 font-mono text-caption uppercase transition-colors duration-200 ${
              on ? "text-fg" : "text-faint hover:text-fg"
            }`}
          >
            <span className={on ? "text-fg" : "text-faint"}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`decoration-mint underline-offset-4 ${
                  on ? "underline decoration-2" : "group-hover:underline"
                }`}
              >
                {s.title}
              </span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}
