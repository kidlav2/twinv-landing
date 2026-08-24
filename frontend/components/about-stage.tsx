"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { about } from "@/lib/content";
import { isDocumentVisible, MACBOOK_SCRUB_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The page's one set piece: a laptop whose lid opens and whose screen then
 * grows until it IS the page's dark zone.
 *
 * The point of doing it this way rather than dropping in a stock scroll-mock
 * is that the thing which expands is the same DOM node the whole way through
 * — a real element holding real text, not a screenshot that gets swapped for
 * content afterwards. That is what makes it read as walking into the screen.
 *
 * It also earns its complexity by replacing three separate effects with one:
 * the laptop, the arrival of the black zone (which is why this page uses no
 * ScrollPanel), and the "there is more below" peek — which comes free, since
 * the closed lid is what shows above the fold while the masthead is still on
 * screen.
 *
 * `data-nav-tone` — a single global slot on <html>, and the one thing on this
 * page allowed to write it. That is why ScrollPanel is deliberately absent
 * here: two components writing that attribute is the exact bug AGENTS.md
 * documents, where whichever cleanup ran last wipes a value it never set.
 *
 * Geometry note: every size below is in viewport units, and the claim's
 * wrapper is sized in `vw` rather than as a percentage of the screen it sits
 * in. That is load-bearing. A percentage width would be relative to the
 * growing screen, so the text would re-wrap on every scroll tick; in `vw` the
 * layout is fixed and only the transform changes, which is also the only way
 * this stays cheap enough to scrub.
 */

/** Where the closed lid sits, as insets on the pinned viewport. */
const SCREEN_CLOSED = {
  left: "32%",
  right: "32%",
  top: "20%",
  bottom: "36%",
  borderRadius: "20px",
};

/**
 * The claim's resting scale — small enough to sit inside the lid.
 *
 * Both widths are in `vw` (76 for the text, 36 for the screen), so the ratio
 * holds at every viewport width and never needs measuring: 36 * 0.8 / 76 ≈
 * 0.38. This is applied as an inline transform rather than only as the
 * timeline's from-value, because the from-value alone is not applied at all
 * when the scripted path bails — a background tab, or no JS — and the laptop
 * would then show the claim at full size, clipped to a fragment by the lid.
 * As a resting CSS value it degrades to a plain open laptop with readable
 * text on screen.
 *
 * It must be a `transform`, never Tailwind's `scale-*` utility: that compiles
 * to the standalone `scale:` property, which multiplies with the `transform`
 * GSAP writes instead of replacing it.
 */
const CLAIM_CLOSED_SCALE = 0.38;

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
        // state here and then freezing would leave a permanently shut laptop
        // with the claim scaled down inside it.
        if (!isDocumentVisible()) return;

        const screen = root.querySelector<HTMLElement>("[data-screen]");
        const claim = root.querySelector<HTMLElement>("[data-claim]");
        const chrome = root.querySelectorAll<HTMLElement>("[data-chrome]");
        if (!screen || !claim) return;

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

        // 1. The lid comes up. transformOrigin bottom is what makes this read
        //    as a hinge rather than a card flipping in space.
        tl.fromTo(
          screen,
          { rotateX: -78, ...SCREEN_CLOSED },
          { rotateX: 0, ease: "none", duration: 0.3 },
          0,
        );
        // 2. The body goes. Once the screen starts growing past it, a laptop
        //    base sticking out from behind a full-bleed panel is just debris.
        tl.to(chrome, { opacity: 0, ease: "none", duration: 0.2 }, 0.32);

        // 3. The screen becomes the viewport. Insets and radius, never scale:
        //    a non-uniform scale would squash the corner radius into an
        //    ellipse — the same reason scroll-panel.tsx animates left/right.
        tl.to(
          screen,
          {
            left: "0%",
            right: "0%",
            top: "0%",
            bottom: "0%",
            borderRadius: "0px",
            ease: "none",
            duration: 0.6,
          },
          0.36,
        );
        // Uniform scale, so type is safe here — and it keeps the claim one
        // continuous object instead of a small one being swapped for a big
        // one at the handover. `fromTo` rather than `to`, so the scrub is
        // anchored to the same value the inline style rests at instead of
        // whatever the element happens to hold when the trigger refreshes.
        tl.fromTo(
          claim,
          { scale: CLAIM_CLOSED_SCALE },
          { scale: 1, ease: "none", duration: 0.6 },
          0.36,
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

      mm.add(
        "(max-width: 63.99rem), (prefers-reduced-motion: reduce)",
        () => {
          // No laptop on this path — `.macbook-only` has already taken it out
          // of the document — so this wrapper collapses to nothing and its
          // bottom edge is exactly where the dark zone starts. Triggering off
          // that edge means no coupling to the section below by id.
          //
          // Deliberately NOT inside a motion check: recolouring the nav is an
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
        },
      );

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
      className="macbook-only bg-canvas relative h-screen overflow-hidden [perspective:1400px]"
    >
      {/* The base. Two flat bars — a deck and the lip below it — and nothing
          else: no keycaps, no speaker grilles, no gradients. The system's
          depth comes from surface contrast, and a photoreal laptop would be
          the one skeuomorphic object on an otherwise flat site. */}
      <div
        data-chrome
        className="bg-carbon absolute top-[64%] left-[30%] h-[2.2%] w-[40%] rounded-[4px]"
      />
      <div
        data-chrome
        className="bg-graphite absolute top-[66.2%] left-[34%] h-[1%] w-[32%] rounded-b-[10px]"
      />

      {/* The screen. Starts as the closed lid, ends as the whole viewport —
          so this single element is both the object and the page's dark zone.
          GSAP owns every transform on it; nothing here writes one, which is
          what keeps Tailwind's standalone `scale:`/`rotate:` properties from
          multiplying with GSAP's `transform`. */}
      <div
        data-screen
        className="bg-carbon absolute overflow-hidden [transform-origin:bottom] [transform-style:preserve-3d]"
        style={SCREEN_CLOSED}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* `shrink-0` is load-bearing: as a flex item this would otherwise
              be squeezed to the lid's width, re-wrapping the claim into a
              tall narrow column — and then re-wrapping it again on every
              scroll tick as the lid grows. Fixed at 76vw it only ever
              re-wraps on resize, and the scrub is a pure transform. */}
          <p
            data-claim
            className="font-display w-[76vw] shrink-0 text-center text-display-xl text-paper"
            style={{ transform: `scale(${CLAIM_CLOSED_SCALE})` }}
          >
            {about.claim}
          </p>
        </div>
      </div>
    </div>
  );
}
