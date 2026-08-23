"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK, PANEL_OVERHANG_VH } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A full-height zone whose background arrives as a rounded card and widens to
 * full viewport width as it scrolls up — the transition between the light and
 * dark halves of the page. It reaches true edge-to-edge width, but never loses
 * its corner radius, even at rest — that reads as the panel's shape, not an
 * animation-in-progress state.
 *
 * Only the background layer is animated, never the content: scaling a section
 * that holds text would drag the type along with it. The panel's resting state
 * (full-bleed, rounded corners) is what you see with motion skipped, so nothing
 * here depends on the tween completing.
 *
 * The DARK panel's background hangs `PANEL_OVERHANG_VH` below its own section.
 * That overhang is what makes the LIGHT panel's entrance visible at all: the
 * light panel is canvas-coloured, and so is `body`, so without black behind it
 * its rounded corners and side insets would be canvas-on-canvas — the tween ran
 * perfectly and was simply invisible.
 */
export function ScrollPanel({
  children,
  tone,
  className = "",
}: {
  children: ReactNode;
  tone: "dark" | "light";
  className?: string;
}) {
  const scope = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const isDark = tone === "dark";

  useGSAP(
    () => {
      // The nav sits over this zone and must recolour itself against it. An
      // attribute toggle, not a tween, so it runs regardless of motion settings.
      //
      // Only the dark zone owns the attribute — light is the default, so a
      // light panel writing "light" would fight the dark one over a single
      // global slot (and in dev, where effects run twice, whichever cleanup
      // landed last would wipe a state it never set).
      //
      // `end` must clear the overhang: the black extends past the section, so
      // ending at the section bottom would flip the nav light over black.
      // One source of truth for the bar height — the CSS token.
      const navPx =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-height",
          ),
          10,
        ) || 113;

      const navTrigger = isDark
        ? ScrollTrigger.create({
            trigger: scope.current,
            start: `top ${navPx}px`,
            end: () =>
              `bottom+=${window.innerHeight * PANEL_OVERHANG_VH} ${navPx}px`,
            onToggle: ({ isActive }) => {
              if (isActive) {
                document.documentElement.dataset.navTone = "dark";
              } else {
                delete document.documentElement.dataset.navTone;
              }
            },
          })
        : null;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        if (!isDocumentVisible()) return;

        // Insets, not a scaleX transform: scaling a rounded rect non-uniformly
        // would squash its corner radius into an ellipse. Animating left/right
        // keeps every corner a true arc at every point in the scrub.
        gsap.fromTo(
          panel.current,
          { left: "8%", right: "8%", borderRadius: "150px 150px 72px 72px" },
          {
            left: "0%",
            right: "0%",
            borderRadius: "56px",
            ease: "none",
            scrollTrigger: {
              trigger: scope.current,
              start: "top bottom",
              // Resolved at scroll-time (not module load), so it tracks the
              // viewport height the trigger actually fires in. A third of the
              // screen of scrolling is enough for the panel to settle.
              end: () => `+=${window.innerHeight * 0.33}`,
              // Low, because ScrollSmoother already adds ~1s of lag; the two
              // compound and a higher scrub here turns to mush.
              scrub: 0.15,
            },
          },
        );
      });

      return () => {
        mm.revert();
        navTrigger?.kill();
        if (isDark) delete document.documentElement.dataset.navTone;
      };
    },
    { scope, dependencies: [tone] },
  );

  return (
    <section
      ref={scope}
      className={`relative ${isDark ? "tone-dark" : ""} ${className}`}
    >
      <div
        ref={panel}
        aria-hidden
        className={`pointer-events-none absolute top-0 left-0 right-0 z-0 origin-top rounded-[56px] ${
          isDark
            ? "bg-carbon"
            : // A hairline gives the light panel a legible silhouette against
              // canvas. On-system: the contract bans shadows, not borders.
              "bg-canvas border-ash border-[1.5px]"
        }`}
        style={{
          bottom: isDark ? `-${PANEL_OVERHANG_VH * 100}vh` : 0,
        }}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
