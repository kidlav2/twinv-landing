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
 * Two different facts, told by two different things. The fill on the rule is
 * how far through the document you are, scrubbed against scroll. The black
 * text is which clause you are in, switched by the observer. They used to be
 * one thing — a coloured border on whichever item was active — which meant
 * the rail could say where you were but never how much was left.
 *
 * Neither is voltage any more. Yellow was inside the token's rule, landing on
 * a rule and a two-digit number rather than a surface, but permitted is not
 * the same as legible: #fff100 on the #e5e5e5 canvas is under 1.3:1, so the
 * one mark telling you where you were was the hardest thing on the page to
 * read.
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
        /* The rail is pinned `navPx + 24` from the top, so its own bottom sits
           that far down PLUS its height. Ending the pin at `bottom navPx+24`
           — which is what this did — released it only once the grid's last
           pixel had climbed to the top of the window, by which point the rail
           was hanging 222px below the grid and straight over the footer.
           Measured on /terms at 1600x900: rail bottom 417, footer top 275.
           Adding the rail's height to the end offset releases it at the exact
           scroll position where its bottom meets the grid's, after which it
           travels up with the page like any other column. A function, not a
           constant, because `invalidateOnRefresh` re-runs it — the rail's
           height changes with the document and the breakpoint. */
        const end = () => `bottom ${navPx + 24 + rail.offsetHeight}px`;

        const pin = ScrollTrigger.create({
          trigger: grid,
          start: `top ${navPx + 24}px`,
          end,
          pin: rail,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });

        /* The reading-progress fill, scrubbed over exactly the range the pin
           holds — so the track is empty as the rail arrives, full at the
           moment it lets go, and never claims progress the reader has not
           made. Same idiom as the case timeline: a `scaleY` on a 1px rule
           that GSAP owns outright, not a gradient and not a height animation.
           `ease: "none"` because a scrubbed indicator that eases is lying
           about position. */
        const fill = rail.querySelector<HTMLElement>("[data-toc-fill]");
        const progress = fill
          ? gsap.fromTo(
              fill,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: grid,
                  start: `top ${navPx + 24}px`,
                  end,
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            )
          : null;

        return () => {
          pin.kill();
          progress?.scrollTrigger?.kill();
          progress?.kill();
        };
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

        {/* One continuous rule down the whole list, not a border per item.
            The track is the document; the fill is how much of it you have
            read. Per-item borders could only ever mark one item at a time,
            which is a different fact and the one the black text already
            states. */}
        <div className="relative">
          <span
            aria-hidden
            className="bg-line absolute top-0 left-0 h-full w-px"
          />
          {/* `transform` inline rather than a `scale-y-0` utility: Tailwind v4
              compiles that to the standalone `scale:` property while GSAP
              writes `transform`, and the two multiply. See AGENTS.md. The
              rest state is empty, so a bundle that never runs leaves a plain
              track rather than a full one. */}
          <span
            data-toc-fill
            aria-hidden
            className="bg-fg absolute top-0 left-0 h-full w-px"
            style={{ transform: "scaleY(0)", transformOrigin: "top" }}
          />
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
                className={`group flex items-baseline gap-3 py-2.5 pl-4 font-mono text-body-sm uppercase transition-colors duration-200 ${
                  on ? "text-fg" : "text-faint hover:text-fg"
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
        </div>
      </nav>
    </div>
  );
}
