"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { isDocumentVisible, MOTION_OK, PANEL_OVERHANG_VH } from "@/lib/motion";
import { ZoneCursor } from "./zone-cursor";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A full-height zone whose background arrives as a rounded card and widens to
 * full viewport width as it scrolls up — the transition between the light and
 * dark halves of the page.
 *
 * Rounding is TOP-ONLY at rest, on both tones. The dark panel's bottom corners
 * are still declared rounded in the entrance tween, but they're never actually
 * seen — the panel hangs `PANEL_OVERHANG_VH` past its section and the light
 * panel paints over that region. The light panel's bottom, by contrast, sits
 * directly above the Footer with nothing after it — a rounded, bordered edge
 * there read as the page visibly "ending" before content that's supposed to
 * just continue. Top-only rounding is the arrival shape; there's no matching
 * "departure" moment to mirror it with.
 *
 * Only the background layer is animated, never the content: scaling a section
 * that holds text would drag the type along with it.
 */
export function ScrollPanel({
  children,
  tone,
  terminal = false,
  cursor = true,
  className = "",
}: {
  children: ReactNode;
  tone: "dark" | "light";
  /**
   * This panel is the last zone on the page — nothing of a different tone
   * follows it. Two things change together, and they MUST stay together (see
   * the overhang note in AGENTS.md):
   *
   *  - No overhang. The overhang exists so the NEXT panel has something to
   *    arrive over; with nothing after it, 38vh of black would just hang off
   *    the end of the document.
   *  - The nav-tone trigger runs to `max` instead of to the overhang. The
   *    zone owns the tone all the way to the bottom of the page, so the nav
   *    must not flip light over it — the same invariant, expressed for a zone
   *    whose end is the document's end.
   */
  terminal?: boolean;
  /**
   * The whole-zone cursor invert. On by default for a dark zone, where it is
   * the homepage's signature; off where the zone already carries its own
   * interactive visual and a second pointer effect would just be noise.
   */
  cursor?: boolean;
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
            end: terminal
              ? "max"
              : () =>
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
            // Bottom corners square at rest — see the file-level note on why
            // dark and light differ only in whether that's ever visible.
            borderRadius: "56px 56px 0px 0px",
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
    { scope, dependencies: [tone, terminal] },
  );

  return (
    <section
      ref={scope}
      className={`relative ${isDark ? "tone-dark" : ""} ${className}`}
    >
      <div
        ref={panel}
        aria-hidden
        className={`pointer-events-none absolute top-0 left-0 right-0 z-0 origin-top rounded-t-[56px] ${
          isDark
            ? "bg-carbon"
            : // A hairline gives the light panel a legible silhouette against
              // canvas. On-system: the contract bans shadows, not borders.
              // Top only — see the file-level note.
              "bg-canvas border-ash border-t-[1.5px]"
        }`}
        style={{
          bottom: isDark && !terminal ? `-${PANEL_OVERHANG_VH * 100}vh` : 0,
        }}
      />
      {/* Whole-zone cursor invert — dark only; there's no matching request
          for the light zone and the effect reads as a "black zone" signature,
          not a general-purpose one. */}
      {isDark && cursor && <ZoneCursor />}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
