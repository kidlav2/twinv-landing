"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { about } from "@/lib/content";
import { isDocumentVisible, MACBOOK_SCRUB_OK } from "@/lib/motion";
import { MacbookBody, LID_W, LID_H } from "./macbook-body";

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
   The laptop is a FIXED pixel object (dimensions live in macbook-body.tsx,
   imported above) uniformly scaled by `--machine-k`. It is not sized as a
   percentage of the viewport, because proportional sizing would have to
   re-proportion ~79 keycaps and their legends per viewport width, and the
   legends would stop being legible at the small end.

   Every position below is CSS calc built from those same constants times the
   same variable, so the deck and the lid cannot drift apart, and the scrub
   reads the variable back for its from-values. The screen's end state is
   0/0/viewport, so every value the tween touches is px → px: no unit
   conversion anywhere in the scrub. */
const k = (px: number) => `${px}px * var(--machine-k)`;

/**
 * The LID is what gets centred, not the whole machine.
 *
 * Centring the machine put the screen's middle well above the viewport's, so
 * the expansion started from a point above centre and appeared to unfold
 * upward over everything. With the lid centred, the growth starts exactly at
 * the middle of the screen. The deck then runs off the bottom edge on shorter
 * viewports, which is a crop rather than a bug — a product shot of a laptop
 * whose front edge leaves the frame.
 */
const COL_LEFT = `calc(50% - ${k(LID_W / 2)})`;
const LID_TOP = `calc(50% - ${k(LID_H / 2)})`;
const BASE_TOP = `calc(50% + ${k(LID_H / 2)})`;

/**
 * The vanishing point, parked on the middle of the lid rather than the middle
 * of the section.
 *
 * `perspective` resolves its origin against the element that declares it, so
 * with the default `50% 50%` the vanishing point sat at the centre of a
 * full-height section rather than on the panel, and the hinge rotation came
 * out keystoned. Now that the lid is centred, eye level and the section's
 * middle coincide — but this stays written out, because it has to follow the
 * lid if the lid ever moves again.
 */
const EYE_LEVEL = "50%";

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
const CLAIM_REST_SCALE = 0.56;

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

        /** Current scale factor, read back from the CSS that sets it. */
        const mk = () =>
          parseFloat(getComputedStyle(root).getPropertyValue("--machine-k")) ||
          1;

        /**
         * The lid opens on the way IN, before anything is pinned.
         *
         * It used to be the first third of the pinned timeline, which meant
         * you scrolled the section to the top of the screen, it locked, and
         * only then did the machine start to move — the reported "it opens
         * once you are already past the middle". Tying it to the section's
         * approach instead means the laptop opens as it rises into view and
         * is fully open exactly when the pin takes over, so the pin only ever
         * does one thing: grow the screen.
         */
        const openTl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 88%",
            end: "top top",
            scrub: 0.3,
            invalidateOnRefresh: true,
          },
        });
        openTl.fromTo(
          screen,
          { rotateX: -76 },
          { rotateX: 0, ease: "power2.out", duration: 1 },
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=150%",
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

        // 1. The machine goes. Once the screen grows past it, a deck sticking
        //    out from behind a full-bleed panel is just debris.
        tl.to(chrome, { opacity: 0, ease: "none", duration: 0.16 }, 0.06);

        // 2. The screen becomes the viewport. Insets and size, never scale: a
        //    non-uniform scale would squash the corner radius into an ellipse
        //    and drag the type with it — the same reason scroll-panel.tsx
        //    animates left/right rather than scaling.
        //    Measured against the CONTAINER, never `window.innerWidth`. The
        //    two differ by the scrollbar, and the CSS that places the lid
        //    centres it on the container — so using the window width here
        //    shifted the panel a few pixels right the instant the tween took
        //    over (the reported "the display sits crooked"), and overshot the
        //    right edge at the end by the same amount.
        tl.fromTo(
          screen,
          {
            left: () => (root.clientWidth - LID_W * mk()) / 2,
            top: () => (root.clientHeight - LID_H * mk()) / 2,
            width: () => LID_W * mk(),
            height: () => LID_H * mk(),
            borderRadius: 16,
          },
          {
            left: 0,
            top: 0,
            width: () => root.clientWidth,
            height: () => root.clientHeight,
            borderRadius: 0,
            ease: "none",
            duration: 0.72,
          },
          0.1,
        );

        // Uniform scale, so type is safe here — and it keeps the claim one
        // continuous object rather than a small one swapped for a big one at
        // the handover. The end scale targets a constant share of the
        // viewport width, which is what makes the final frame land the same
        // way on a 1024 laptop as on a 1920 monitor. The upper bound only
        // stops a very wide screen from setting this at ~250px.
        tl.fromTo(
          claim,
          { scale: () => CLAIM_REST_SCALE * mk() },
          {
            scale: () => Math.min(1.35, (root.clientWidth * 0.86) / CLAIM_W),
            ease: "none",
            duration: 0.72,
          },
          0.1,
        );

        // Fonts arrive through next/font with display: swap, which changes
        // the masthead's height after first paint and moves this trigger's
        // start with it. Deferred a frame because calling refresh() from
        // inside GSAP's own update can re-enter one already running.
        const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          cancelAnimationFrame(raf);
          // The open timeline owns its own trigger, so matchMedia's revert
          // does not reach it the way it reaches `tl`'s.
          openTl.scrollTrigger?.kill();
          openTl.kill();
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
      /* `-mb-px` closes the last seam. At the end of the scrub the expanded
         screen fills this section exactly, and the black zone starts on the
         very next pixel row — two independently rounded boxes on a
         sub-pixel-offset scroller, which is what left a flickering hairline
         right where the pinned animation hands over to the static section.
         One pixel of overlap has nothing to show through, and because the
         section is `display: none` below `lg` the margin disappears with it. */
      className="macbook-only bg-canvas relative -mb-px h-screen overflow-hidden"
      style={{
        perspective: "1900px",
        perspectiveOrigin: `50% ${EYE_LEVEL}`,
      }}
    >
      {/* Drawn at design size and scaled from its own top-left corner, so the
          rendered box is exactly LID_W×BASE_H times the factor — which is what
          the lid's position calc assumes. GSAP only ever writes `opacity`
          here, never a transform, so this CSS scale is not the multiplying
          conflict AGENTS.md warns about. */}
      <MacbookBody
        style={{
          left: COL_LEFT,
          top: BASE_TOP,
          transform: "scale(var(--machine-k))",
          transformOrigin: "top left",
        }}
      />

      {/* The lid. Starts as the closed screen, ends as the whole viewport —
          one element that is both the object and the page's dark zone. GSAP
          owns every transform on it; nothing here writes one, which keeps
          Tailwind's standalone `scale:`/`rotate:` properties from multiplying
          with GSAP's `transform`. */}
      <div
        data-screen
        className="bg-carbon absolute overflow-hidden [transform-origin:bottom]"
        style={{
          left: COL_LEFT,
          top: LID_TOP,
          width: `calc(${k(LID_W)})`,
          height: `calc(${k(LID_H)})`,
          borderRadius: 16,
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
              // Times the machine scale, so it fits the lid at every step.
              transform: `scale(calc(${CLAIM_REST_SCALE} * var(--machine-k)))`,
            }}
          >
            {about.claim}
          </p>
        </div>
      </div>
    </div>
  );
}
