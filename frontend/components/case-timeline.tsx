"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  isDocumentVisible,
  MOTION_OK,
  REVEAL,
  TIMELINE_PIN_OK,
} from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Aceternity's Timeline as a layout idea, rewritten for this site.
 *
 * Not the registry component: it ships Framer Motion, `bg-white`, a purple
 * fill, and a shadow stack — all of which the playbook and AGENTS.md forbid
 * here. The behaviour we kept is the useful part: a title that stays while
 * its body scrolls, and a line that fills with the scroll.
 *
 * Pin, not CSS sticky — see TIMELINE_PIN_OK. The fill is a `scaleY`
 * transform (GSAP owns it); the track is a 1px role colour, not a gradient.
 *
 * Body copy uses the same reveal as the rest of the site (`REVEAL`), keyed
 * per child so three "what we did" steps do not all fire when the first one
 * arrives. Titles fade only — no `y`. Pin writes `transform`, and a second
 * tween on the same property would multiply against it.
 */
export function CaseTimeline({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const navPx =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-height",
          ),
          10,
        ) || 113;

      const mm = gsap.matchMedia();

      mm.add(TIMELINE_PIN_OK, () => {
        const beats = gsap.utils.toArray<HTMLElement>("[data-beat]", root);
        const pins = beats.map((beat) => {
          const title = beat.querySelector<HTMLElement>("[data-title]");
          if (!title) return null;
          return ScrollTrigger.create({
            trigger: beat,
            start: `top ${navPx}px`,
            end: `bottom ${navPx}px`,
            pin: title,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });
        });
        return () => pins.forEach((p) => p?.kill());
      });

      mm.add(MOTION_OK, () => {
        // Same order as reveal.tsx: visibility first, then the hide. A
        // background tab never fires onEnter, so hiding without this guard
        // would leave the copy invisible forever.
        if (!isDocumentVisible()) return;

        const titles = gsap.utils.toArray<HTMLElement>("[data-title]", root);
        const bits = gsap.utils.toArray<HTMLElement>("[data-body] > *", root);

        gsap.set(titles, { opacity: 0, willChange: "opacity" });
        gsap.set(bits, {
          opacity: 0,
          y: REVEAL.y,
          willChange: "transform,opacity",
        });

        ScrollTrigger.batch(titles, {
          start: REVEAL.start,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              duration: REVEAL.duration,
              ease: REVEAL.ease,
              overwrite: true,
              onComplete: () => gsap.set(batch, { clearProps: "willChange" }),
            }),
        });

        ScrollTrigger.batch(bits, {
          start: REVEAL.start,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: REVEAL.duration,
              ease: REVEAL.ease,
              stagger: { each: REVEAL.stagger },
              overwrite: true,
              onComplete: () => gsap.set(batch, { clearProps: "willChange" }),
            }),
        });

        const fill = root.querySelector<HTMLElement>("[data-fill]");
        if (!fill) return;

        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: {
              trigger: root,
              start: "top 70%",
              end: "bottom 55%",
              scrub: 0.15,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="relative">
      <div
        aria-hidden
        className="bg-line pointer-events-none absolute inset-y-0 left-[3.5px] w-px"
      >
        <div
          data-fill
          className="bg-voltage absolute inset-x-0 top-0 h-full origin-top"
        />
      </div>
      <div className="flex flex-col gap-16 lg:gap-28">{children}</div>
    </div>
  );
}

export function CaseBeat({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      data-beat
      className="relative grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-12"
    >
      {/* col-span stays on this wrapper so a pin-spacer cannot steal the
          column. GSAP wraps `data-title`; the grid still sees 4 + 8. */}
      <div className="lg:col-span-4">
        <div data-title className="bg-carbon z-10 flex items-center gap-4">
          {/* Centered on the title block (two lines sit either side of the
              square) and on the 1px rail — the track is `left-[3.5px]` so it
              runs through the middle of this 8px mark, not past its top. */}
          <span aria-hidden className="bg-fg size-2 shrink-0" />
          <h2 className="font-display max-w-[10ch] text-heading-lg">{title}</h2>
        </div>
      </div>
      <div data-body className="pl-6 lg:col-span-8 lg:pl-0">
        {children}
      </div>
    </div>
  );
}
