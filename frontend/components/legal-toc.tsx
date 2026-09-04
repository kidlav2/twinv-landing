"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TIMELINE_PIN_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The pinned section rail beside a legal document.
 *
 * Pinned with ScrollTrigger, not `position: sticky` — the same reason the case
 * timeline pins its titles, and it is written down in `lib/motion.ts`: this
 * page lives inside ScrollSmoother, which transforms `#smooth-content`, and a
 * transformed ancestor becomes the containing block. Sticky under that resolves
 * against the transformed box rather than the viewport, so the rail rides up
 * with the page instead of holding its place. It was built with `sticky` first
 * and did exactly that.
 *
 * `pinSpacing: false` because the rail sits in its own grid column and the
 * clauses beside it already set the row height — spacing would add a phantom
 * gap under the column. The `col-span` stays on the parent in `legal-page.tsx`
 * so GSAP's pin wrapper cannot steal the column from the grid.
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
 *
 * The active and hovered item is marked in `fg`, not voltage. Yellow was
 * inside the token's rule — it landed on a 2px rule and a two-digit number,
 * never on a surface — but being permitted is not the same as being legible:
 * #fff100 on the #e5e5e5 canvas is a contrast ratio under 1.3:1, so the one
 * number the rail was using to tell you where you are was the hardest thing
 * on the page to read. Black rule, black number, grey for the rest.
 *
 * No `isDocumentVisible()` guard here, unlike the reveals: this component
 * hides nothing. If the bundle never runs, the rail is simply a plain list in
 * the flow, which is a working page rather than a blank one.
 */
export function LegalToc({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rail = scope.current;
      const grid = rail?.closest<HTMLElement>("[data-legal-grid]");
      if (!rail || !grid) return;

      /* `--nav-height` steps up at two breakpoints; parse it rather than
         repeating the number, same as scroll-panel and smooth-scroll. */
      const navPx =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-height",
          ),
          10,
        ) || 96;

      const mm = gsap.matchMedia();

      mm.add(TIMELINE_PIN_OK, () => {
        const pin = ScrollTrigger.create({
          trigger: grid,
          start: `top ${navPx + 24}px`,
          end: `bottom ${navPx + 24}px`,
          pin: rail,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
        return () => pin.kill();
      });

      return () => mm.revert();
    },
    { scope },
  );

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
    <div ref={scope}>
      <nav aria-label="On this page" className="flex flex-col">
        <p className="text-fg mb-5 font-mono text-caption uppercase">
          On this page
        </p>
        {sections.map((s, i) => {
          const on = s.id === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={on ? "true" : undefined}
              /* The border colour is set in exactly ONE of the two branches
                 and never on the base class. `border-line` on the base plus
                 `border-fg` in the active branch is two utilities painting
                 the same property at the same specificity, and which one wins
                 is decided by Tailwind's own output order, not by the order
                 they are written here — the active rule lost, and the rail
                 stayed ash. Same lesson as the nav in AGENTS.md: remove the
                 competition rather than try to outrank it. */
              className={`group -ml-px flex items-baseline gap-3 border-l py-2.5 pl-4 font-mono text-body-sm uppercase transition-colors duration-200 ${
                on
                  ? "border-fg text-fg"
                  : "border-line text-faint hover:border-fg hover:text-fg"
              }`}
            >
              <span
                className={`shrink-0 text-caption transition-colors duration-200 ${
                  on ? "text-fg" : "group-hover:text-fg"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 leading-[1.35]">{s.title}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
