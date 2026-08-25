"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { about } from "@/lib/content";
import { isDocumentVisible, MACBOOK_SCRUB_OK } from "@/lib/motion";
import {
  MacbookBody,
  MacbookLid,
  LID_W,
  LID_H,
  BASE_H,
  BEZEL,
  SCREEN_W,
  SCREEN_H,
  SCREEN_R,
  kpx,
} from "./macbook-body";

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

/**
 * The WHOLE machine is placed, not the lid, and the leftover height is split
 * unevenly: `TOP_SHARE` of it above the machine, the rest below.
 *
 * Two earlier schemes both failed on the same axis. Centring the lid put the
 * hinge at 50% and pushed the deck's own bottom edge off the section on
 * anything shorter than ~1400px, so the machine arrived cropped. Anchoring
 * the deck a fixed distance above the bottom fixed the crop but fixed the
 * headroom too — on a 1000px-tall viewport, where `--machine-k` is 1 and the
 * machine is 935 design px tall, a fixed pad has nowhere to come from and the
 * lid runs off the TOP instead.
 *
 * A share of the free space cannot do either: whatever is left over after the
 * machine is placed, both gaps stay positive and in proportion. 0.08 is a
 * hair of clearance so the tilted lid does not kiss the section's top edge —
 * any more than that is empty canvas between this machine and the line it
 * answers, and that gap has been cut twice already.
 */
const TOP_SHARE = 0.08;
const MACHINE_H = BASE_H + LID_H;
/** Design-space offset down from the machine's own top edge. */
const below = (px: number) =>
  `calc((100% - ${MACHINE_H}px * var(--machine-k)) * ${TOP_SHARE} + ${px}px * var(--machine-k))`;

const LID_LEFT = `calc(50% - ${LID_W / 2}px * var(--machine-k))`;
const SCREEN_LEFT = `calc(50% - ${LID_W / 2 - BEZEL}px * var(--machine-k))`;

const LID_TOP = below(0);
/** The panel, inset into the lid by one bezel on every side. */
const SCREEN_TOP = below(BEZEL);
/** The hinge line: the lid's bottom edge, where the deck starts. */
const BASE_TOP = below(LID_H);

/**
 * The vanishing point, parked on the middle of the lid rather than the middle
 * of the section.
 *
 * `perspective` resolves its origin against the element that declares it, so
 * with the default `50% 50%` the vanishing point would sit at the centre of a
 * full-height section rather than on the panel, and the hinge rotation would
 * come out keystoned. This has to move if the lid ever moves again — it is
 * written out from the same constants rather than copied as a number so it
 * always does.
 */
const EYE_LEVEL = below(LID_H / 2);

/**
 * Viewing distance, in design px — so it scales with the machine and the
 * amount of distortion is the same at every `--machine-k`. A fixed px value
 * here would make the laptop look wider-angle on a short viewport.
 *
 * 1600 against a 475-tall lid puts the tilted lid's top edge about 20% wider
 * than its hinge. That keystone is the whole point: it is what says "object
 * standing in space" rather than "rectangle with a rotation on it".
 */
const VIEW_DISTANCE = 1600;

/**
 * The angle the machine sits at. Permanently — the lid never opens.
 *
 * This is the correction that matters most against the reference. The laptop
 * there is a PROP: it is half open when it arrives, it is half open when it
 * leaves, and it never animates. What moves is the display alone, which slides
 * out of the lid and comes at you. Animating the lid open was inventing a
 * second event for a section that only has one, and it also meant the machine
 * was only ever seen in the pose it ends in.
 *
 * TWO values, which is how the reference gets its "barely cracked" look.
 * Rotation alone cannot flatten a panel that far without swinging its near
 * edge so close to the camera that perspective blows the top edge into a
 * wedge. So most of the flattening is a plain vertical squash and only a
 * modest part is rotation:
 *
 *   visible height = LID_H × REST_SQUASH × cos(REST_TILT) ≈ 0.56 × LID_H
 *
 * the same 0.56 the reference lands on (its 0.6 scaleY against 28°), while
 * the near edge comes only ~11% closer instead of ~34%.
 *
 * Written as a CSS string because the aluminium wears it as a resting style
 * and never sees GSAP at all. The display starts from the identical value, so
 * the two are one object until the scroll separates them — and with no JS the
 * page still shows a correctly-posed laptop rather than a flat one.
 */
const REST_TILT = -34;
const REST_SQUASH = 0.68;
const REST_TRANSFORM = `rotateX(${REST_TILT}deg) scaleY(${REST_SQUASH})`;

/**
 * Three beats on one pin.
 *
 * The display used to sit still at the lid's own height and only grow once
 * the machine had fully left. That is the "too late, too high" frame: the
 * panel unfolds upward from a hinge that is already near the top of the
 * viewport, the claim clips, and the expansion then starts from a box that
 * is no longer in the middle of the screen.
 *
 * Now the panel comes to the viewer first. While the machine is still in
 * frame it unfolds and drops until it is centred — that is the detach, and
 * it is the pose the expansion starts from. `DETACH_END` is early on purpose:
 * at 0.26 the machine had already scrolled the lid to about two-thirds of
 * the way off, so the panel looked as if it peeled away up there. Landing
 * the same move at ~15% of the pin puts the panel on the midline while the
 * aluminium is still in the top half.
 *
 * The last fraction after `EXPAND_END` is a hold on solid black, and it is
 * what the nav recolouring is timed against: the attribute flips instantly
 * while the scrub is still a beat behind (ScrollSmoother's own lag), so the
 * flip has to happen with the panel a hair short of full-bleed.
 */
const DETACH_END = 0.13;
const EXPAND_END = 0.86;
/** Extra scroll the pin consumes, as a fraction of the section's own height
 *  (the section is `h-screen`, so this is also viewport-heights). Kept as
 *  one number so the machine's travel and the pin's end cannot drift: a
 *  shorter travel than the pin is what made the laptop look as if it had
 *  paused inside a frozen frame. */
const PIN_VH = 1.7;

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
        const machine = root.querySelector<HTMLElement>("[data-machine]");
        if (!screen || !claim || !machine) return;

        /** Current scale factor, read back from the CSS that sets it. */
        const mk = () =>
          parseFloat(getComputedStyle(root).getPropertyValue("--machine-k")) ||
          1;

        /* The display's box, measured against the CONTAINER and never
           `window.innerWidth`. The two differ by the scrollbar, and the CSS
           that places the lid centres it on the container — so a window
           measurement shifted the panel a few pixels right the instant the
           tween took over (the reported "the display sits crooked") and
           overshot the right edge at the end by the same amount. Functions,
           not values, so `invalidateOnRefresh` can re-read them after a
           resize changes `--machine-k`.

           Two stations, same size. The panel never shrinks — it only changes
           where it sits. `seated` is the lid, `mid` is the vertical centre of
           this section, and that is the pose the expansion starts from, so
           the growth is from the middle of the screen rather than from a
           hinge that has already run off the top. */
        const seated = () => {
          const k = mk();
          return {
            w: SCREEN_W * k,
            h: SCREEN_H * k,
            left: (root.clientWidth - SCREEN_W * k) / 2,
            top: (root.clientHeight - MACHINE_H * k) * TOP_SHARE + BEZEL * k,
            r: SCREEN_R * k,
          };
        };
        const mid = () => {
          const b = seated();
          return { ...b, top: (root.clientHeight - b.h) / 2 };
        };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: `+=${PIN_VH * 100}%`,
            pin: true,
            // Low, for the reason scroll-panel.tsx gives: ScrollSmoother
            // already adds about a second of lag and the two compound.
            scrub: 0.2,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => {
              // Flip while the panel still has a little way to go, not after
              // the pin releases. By the end of the scrub the viewport is
              // solid black and stays black through the section below, so a
              // nav still painted light here is the "light nav over black"
              // failure AGENTS.md calls out.
              setTone(progress >= 0.84);
            },
          },
        });

        // 1. The machine keeps scrolling. `ease: "none"` and a travel equal
        //    to the pin's own distance are both load-bearing: any ease-in
        //    (the previous `power2.in`) spends the first third of the pin
        //    barely moving, which is the "it froze" reading, and a shorter
        //    travel than the pin means the aluminium stops inside a still-
        //    pinned frame and waits. 1:1 with the pin, linear, the whole
        //    timeline — it never sits. Full opacity the whole way: the
        //    system has no elevation and no scrim, so a dissolving object
        //    has nothing to dissolve into.
        tl.fromTo(
          machine,
          { y: 0 },
          {
            y: () => -root.clientHeight * PIN_VH,
            ease: "none",
            duration: EXPAND_END,
          },
          0,
        );

        // 2. The display detaches: it unfolds out of the machine's pose and
        //    drops to the vertical centre, same size. `y`, never `top` —
        //    CSSPlugin rounds layout px to integers (`autoRound`), so a
        //    scrubbed `top` is a visible 1px stairstep on every tick. `y`
        //    is a transform and stays on the compositor. Width/height/left
        //    stay with the lid so this is a change of position, not a
        //    shrink. Origin is on the hinge, so unwinding the squash opens
        //    it toward the viewer instead of dragging the hinge with it.
        tl.fromTo(
          screen,
          { rotateX: REST_TILT, scaleY: REST_SQUASH, y: 0 },
          {
            rotateX: 0,
            scaleY: 1,
            y: () => mid().top - seated().top,
            ease: "none",
            duration: DETACH_END,
            force3D: true,
          },
          0,
        );

        // 3. From that centred pose, the display becomes the page.
        //    `y: 0` in the from is the handover: step 2 left the box at the
        //    lid's `top` plus a translate; this puts the same pixels on
        //    `top` and clears the translate so the expansion is one box,
        //    not a box chasing a leftover `y`. `immediateRender: false` is
        //    load-bearing: a `fromTo` in a timeline applies its from-values
        //    the moment it is built, which for a tween scheduled at
        //    DETACH_END would stamp the mid-screen box over the resting
        //    state and start the section mid-animation.
        //    `autoRound: false` because this step does have to move `top` /
        //    `left` / `width` / `height` (a non-uniform scale would squash
        //    the radius and the type — same reason scroll-panel.tsx animates
        //    the box), and integer rounding on those is the same stairstep.
        tl.fromTo(
          screen,
          {
            y: 0,
            left: () => mid().left,
            top: () => mid().top,
            width: () => mid().w,
            height: () => mid().h,
            borderRadius: () => mid().r,
          },
          {
            y: 0,
            left: 0,
            top: 0,
            width: () => root.clientWidth,
            height: () => root.clientHeight,
            borderRadius: 0,
            ease: "none",
            duration: EXPAND_END - DETACH_END,
            immediateRender: false,
            autoRound: false,
            force3D: true,
          },
          DETACH_END,
        );

        // The line rides the panel at a constant share of its width, so it is
        // one continuous object rather than two sizes cut together — it holds
        // its seated scale for the whole of the detach, since the panel
        // itself does not change size there either. The end scale targets a
        // constant share of the viewport width, which is what makes the
        // final frame land the same way on a 1024 laptop as on a 1920
        // monitor. The upper bound only stops a very wide screen from setting
        // this at ~250px.
        tl.fromTo(
          claim,
          { scale: () => CLAIM_REST_SCALE * mk() },
          {
            scale: () => Math.min(1.35, (root.clientWidth * 0.86) / CLAIM_W),
            ease: "none",
            duration: EXPAND_END - DETACH_END,
            immediateRender: false,
          },
          DETACH_END,
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
      /* `-mb-px` closes the last seam. At the end of the scrub the expanded
         screen fills this section exactly, and the black zone starts on the
         very next pixel row — two independently rounded boxes on a
         sub-pixel-offset scroller, which is what left a flickering hairline
         right where the pinned animation hands over to the static section.
         One pixel of overlap has nothing to show through, and because the
         section is `display: none` below `lg` the margin disappears with it. */
      className="macbook-only bg-canvas relative -mb-px h-screen overflow-hidden"
      style={{
        perspective: kpx(VIEW_DISTANCE),
        perspectiveOrigin: `50% ${EYE_LEVEL}`,
      }}
    >
      {/* The machine: deck and lid as ONE rigid object, because that is how
          it behaves — it never opens, it only leaves.

          The wrapper exists so each element has exactly one author for its
          `transform`, which is the rule AGENTS.md states and the reason this
          is not simply two siblings. GSAP writes `y` here and nowhere else
          inside; the deck keeps its CSS `scale()` and the lid its CSS pose,
          and neither can be multiplied by a tween.

          `preserve-3d` is what pays for that wrapper. `perspective` on the
          section only reaches its own children, so without this the lid would
          be a grandchild rendered flat — the tilt would survive as a plain
          vertical squash with no keystone at all, which is most of what makes
          the object look like an object. */}
      <div
        data-machine
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Drawn at design size and scaled from its own top-left corner, so
            the rendered box is exactly LID_W×BASE_H times the factor — which
            is what the lid's position calc assumes. */}
        <MacbookBody
          style={{
            left: LID_LEFT,
            top: BASE_TOP,
            transform: "scale(var(--machine-k))",
            transformOrigin: "top left",
          }}
        />

        {/* The aluminium, posed about its own bottom edge, which IS the hinge
            line — the lid sits directly on the deck. */}
        <MacbookLid
          style={{
            left: LID_LEFT,
            top: LID_TOP,
            transform: REST_TRANSFORM,
            transformOrigin: "50% 100%",
          }}
        />
      </div>

      {/* The display, and the only thing on this page that animates. It starts
          seated in the lid above, comes to the middle of the frame, and ends
          as the page's dark zone — one element that is the object, the
          transition, and the section it becomes.

          Deliberately NOT inside the machine wrapper: it has to stay where the
          machine no longer is, and it has to be able to outgrow any box.

          It carries the machine's resting pose in CSS so that at rest the two
          are indistinguishable, and so a browser that never runs the script
          still gets a correctly-posed laptop. GSAP takes the whole `transform`
          property over from there — which is fine, and is the same handover
          the claim below uses — but Tailwind's standalone `scale:`/`rotate:`
          utilities would MULTIPLY with it, so they must never appear here.

          The origin is pushed one bezel BELOW this box's own bottom so it
          lands on the aluminium's bottom edge. That is what makes the two
          share an axis and read as one lid; using each box's own bottom would
          let the display creep out of its frame. Once the pose is unwound the
          origin stops mattering, which is why the later tweens can move this
          box anywhere. */}
      <div
        data-screen
        className="bg-carbon absolute overflow-hidden"
        style={{
          left: SCREEN_LEFT,
          top: SCREEN_TOP,
          width: kpx(SCREEN_W),
          height: kpx(SCREEN_H),
          borderRadius: kpx(SCREEN_R),
          transform: REST_TRANSFORM,
          transformOrigin: `50% calc(100% + ${BEZEL}px * var(--machine-k))`,
          backfaceVisibility: "hidden",
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
