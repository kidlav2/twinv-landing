"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { about } from "@/lib/content";
import { isDocumentVisible, MACBOOK_SCRUB_OK } from "@/lib/motion";
import { MacbookBody, MacbookLip } from "./macbook-body";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The page's one set piece: a laptop whose lid opens and whose screen then
 * grows until it IS the page's dark zone.
 *
 * What makes it worth the code is that the thing which expands is the same
 * DOM node the whole way through — a real element holding real text, not a
 * screenshot swapped for content afterwards. That is what reads as walking
 * into the screen.
 *
 * It also earns its complexity by replacing three separate effects with one:
 * the laptop, the arrival of the black zone (which is why this page uses no
 * ScrollPanel), and the "there is more below" cue.
 *
 * `data-nav-tone` — a single global slot on <html>, and this is the one thing
 * on this page allowed to write it. That is why ScrollPanel is deliberately
 * absent: two components writing that attribute is the exact bug AGENTS.md
 * documents, where whichever cleanup ran last wipes a value it never set.
 */

/* ---- Geometry -------------------------------------------------------------
   The laptop is a FIXED pixel object, not a percentage of the viewport. That
   is what lets the keyboard exist at all: proportional sizing would have to
   scale ~70 keycaps and their legends per viewport width, and the legends
   would stop being legible at the small end.

   Everything below is derived from these four numbers, in both the CSS that
   places the parts and the tween that grows the screen, so the two cannot
   drift apart. The screen's end state is 0/0/viewport, so every value the
   tween touches is px → px: no unit conversion anywhere in the scrub. */
const LID_W = 560;
const LID_H = 350;
const BASE_H = 300;
const TOTAL_H = LID_H + BASE_H;

/** Left edge of the whole machine, and the top of the lid, as CSS calc. */
const COL_LEFT = `calc(50% - ${LID_W / 2}px)`;
const LID_TOP = `calc(50% - ${TOTAL_H / 2}px)`;
const BASE_TOP = `calc(50% - ${TOTAL_H / 2 - LID_H}px)`;
const LIP_TOP = `calc(50% - ${TOTAL_H / 2 - LID_H - BASE_H}px)`;

/**
 * The claim's box is a fixed width for the same reason the laptop is: as a
 * flex child of a box whose width is being animated, a relative width would
 * re-wrap the text on every scroll tick. Fixed, only the transform moves.
 */
const CLAIM_W = 1120;

/**
 * Fixed, and deliberately NOT the `text-display-xl` token.
 *
 * That token is a viewport clamp, meant for type laid out at viewport width.
 * This block is laid out at a fixed width and then scaled as one unit, so a
 * fluid size on top applies the responsiveness twice — and worse, it changes
 * the LINE COUNT across the range. Measured: at 1440 the claim set in three
 * lines and filled 56% of the screen; at 1024 it fell to two lines and 26%,
 * so the same moment landed completely differently on two normal laptops.
 * Fixed size in a fixed box means the line count is decided once, and the
 * scale below is the only thing that responds.
 */
const CLAIM_FONT = 160;

/**
 * Its resting scale — the size that fits inside the closed lid.
 *
 * Applied as an inline transform rather than only as the timeline's from
 * value, because from values are not applied at all when the scripted path
 * bails (background tab, or no JS), and the laptop would then show the claim
 * at full size with the lid cropping it to a fragment. As a resting CSS value
 * it degrades to a plain open laptop with readable text on screen.
 *
 * It must be a `transform`, never Tailwind's `scale-*` utility: that compiles
 * to the standalone `scale:` property, which multiplies with the `transform`
 * GSAP writes instead of replacing it.
 */
const CLAIM_REST_SCALE = 0.42;

export function AboutStage() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      let toneIsDark = false;
      const setTone = (dark: boolean) => {
        if (dark === toneIsDark) return;
        toneIsDark = dark;
        if (dark) {
          document.documentElement.dataset.navTone = "dark";
        } else {
          delete document.documentElement.dataset.navTone;
        }
      };

      const mm = gsap.matchMedia();

      /* The two branches below are exact complements, so precisely one is
         ever live and the single-writer rule above holds by construction.
         They are also the same split as `.macbook-only` / `.macbook-fallback`
         in globals.css — three places, one condition. */

      mm.add(MACBOOK_SCRUB_OK, () => {
        // First line, above any gsap.set — the standing rule for anything
        // that hides or displaces content. A scrub only advances on scroll,
        // which a background tab never sends, so applying the closed-lid
        // state here and then freezing would leave a shut laptop forever.
        if (!isDocumentVisible()) return;

        const screen = root.querySelector<HTMLElement>("[data-screen]");
        const claim = root.querySelector<HTMLElement>("[data-claim]");
        const chrome = root.querySelectorAll<HTMLElement>("[data-chrome]");
        if (!screen || !claim) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=170%",
            pin: true,
            // Low, for the reason scroll-panel.tsx gives: ScrollSmoother
            // already adds about a second of lag and the two compound.
            scrub: 0.2,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => {
              // Flip while the screen still has a little way to go, not after
              // the pin releases. By the end of the scrub the viewport is
              // solid black and stays black through the section below, so a
              // nav still painted light here is the "light nav over black"
              // failure AGENTS.md calls out.
              setTone(progress >= 0.82);
            },
          },
        });

        // 1. The lid comes up. transformOrigin bottom is what makes this a
        //    hinge rather than a card flipping in space, and it is why the
        //    deck below has to sit exactly LID_H down from the lid's top.
        tl.fromTo(
          screen,
          { rotateX: -80 },
          { rotateX: 0, ease: "power1.out", duration: 0.34 },
          0,
        );

        // 2. The machine goes. Once the screen grows past it, a deck sticking
        //    out from behind a full-bleed panel is just debris.
        tl.to(chrome, { opacity: 0, ease: "none", duration: 0.18 }, 0.36);

        // 3. The screen becomes the viewport. Insets and size, never scale: a
        //    non-uniform scale would squash the corner radius into an ellipse
        //    and drag the type with it — the same reason scroll-panel.tsx
        //    animates left/right rather than scaling.
        tl.fromTo(
          screen,
          {
            left: () => (window.innerWidth - LID_W) / 2,
            top: () => (window.innerHeight - TOTAL_H) / 2,
            width: LID_W,
            height: LID_H,
            borderRadius: 14,
          },
          {
            left: 0,
            top: 0,
            width: () => window.innerWidth,
            height: () => window.innerHeight,
            borderRadius: 0,
            ease: "none",
            duration: 0.58,
          },
          0.4,
        );

        // Uniform scale, so type is safe here — and it keeps the claim one
        // continuous object rather than a small one swapped for a big one at
        // the handover. The end scale targets a constant share of the
        // viewport width, which is what makes the final frame land the same
        // way on a 1024 laptop as on a 1920 monitor. The upper bound only
        // stops a very wide screen from setting this at ~250px.
        tl.fromTo(
          claim,
          { scale: CLAIM_REST_SCALE },
          {
            scale: () =>
              Math.min(1.35, (window.innerWidth * 0.86) / CLAIM_W),
            ease: "none",
            duration: 0.58,
          },
          0.4,
        );

        // Fonts arrive through next/font with display: swap, which changes
        // the masthead's height after first paint and moves this trigger's
        // start with it. Deferred a frame because calling refresh() from
        // inside GSAP's own update can re-enter one already running.
        const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          cancelAnimationFrame(raf);
          setTone(false);
        };
      });

      mm.add("(max-width: 63.99rem), (prefers-reduced-motion: reduce)", () => {
        // No laptop on this path — `.macbook-only` has already taken it out
        // of the document — so this wrapper collapses to nothing and its
        // bottom edge is exactly where the dark zone starts. Triggering off
        // that edge means no coupling to the section below by id.
        //
        // Deliberately NOT behind a motion check: recolouring the nav is an
        // attribute write, not an animation, and it has to happen for
        // reduced-motion users too. ScrollPanel keeps the same separation.
        const navPx =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--nav-height",
            ),
            10,
          ) || 113;

        const trigger = ScrollTrigger.create({
          trigger: root,
          start: `bottom ${navPx}px`,
          end: "max",
          onToggle: ({ isActive }) => setTone(isActive),
        });

        return () => {
          trigger.kill();
          setTone(false);
        };
      });

      return () => {
        mm.revert();
        setTone(false);
      };
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      /* `macbook-only` collapses this to nothing below lg / under reduced
         motion; the claim is rendered instead by the dark zone's
         `macbook-fallback` copy. `perspective` has to live on the parent of
         the rotating element for the hinge to have any depth at all. */
      className="macbook-only bg-canvas relative h-screen overflow-hidden [perspective:1600px]"
    >
      <MacbookBody
        style={{ left: COL_LEFT, top: BASE_TOP, width: LID_W, height: BASE_H }}
      />
      <MacbookLip
        style={{
          left: `calc(50% - ${LID_W * 0.09}px)`,
          top: LIP_TOP,
          width: LID_W * 0.18,
        }}
      />

      {/* The lid. Starts as the closed screen, ends as the whole viewport —
          one element that is both the object and the page's dark zone. GSAP
          owns every transform on it; nothing here writes one, which keeps
          Tailwind's standalone `scale:`/`rotate:` properties from multiplying
          with GSAP's `transform`. */}
      <div
        data-screen
        className="bg-carbon absolute overflow-hidden [transform-origin:bottom] [transform-style:preserve-3d]"
        style={{
          left: COL_LEFT,
          top: LID_TOP,
          width: LID_W,
          height: LID_H,
          borderRadius: 14,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* `shrink-0` is load-bearing: as a flex child of a box whose width
              is animated, this would otherwise be squeezed to the lid and
              re-wrap on every scroll tick. Fixed, the scrub is pure
              transform. */}
          <p
            data-claim
            className="font-display text-paper shrink-0 text-center"
            style={{
              width: CLAIM_W,
              fontSize: CLAIM_FONT,
              lineHeight: 0.95,
              transform: `scale(${CLAIM_REST_SCALE})`,
            }}
          >
            {about.claim}
          </p>
        </div>
      </div>
    </div>
  );
}
