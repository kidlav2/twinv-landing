"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

/** Read the nav height from the design token rather than duplicating it. */
function navOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--nav-height",
  );
  return parseInt(raw, 10) || 113;
}

/**
 * Wraps the scrolling content in ScrollSmoother's required
 * `#smooth-wrapper > #smooth-content` pair.
 *
 * `<Nav />` MUST stay outside this component. ScrollSmoother makes the wrapper
 * `position: fixed; overflow: hidden` and applies a transform to the content —
 * and a transformed ancestor becomes the containing block for `position: fixed`
 * descendants, so a nav rendered inside would scroll away with the page instead
 * of staying pinned to the viewport.
 *
 * Children stay server components; passing RSC children through a client
 * component is fine.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      // StrictMode double-mounts in dev and only one instance may exist.
      ScrollSmoother.get()?.kill();

      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        // 1.0, not the 2.0 you see in demos — scroll smoothing is scroll
        // hijacking, and anything slower reads as sluggish on a trackpad.
        smooth: 1,
        smoothTouch: false,
        ignoreMobileResize: true,
        effects: false,
      });

      // Every route mounts its own SmoothScroll (PageShell has no persistent
      // layout), so this runs fresh on every navigation. Without a hash to
      // honour, land at the top explicitly rather than trusting whatever
      // scrollTop the new wrapper happens to start with — a plain page
      // reporting "opens scrolled to the bottom" is exactly the symptom of
      // that trust being wrong once, and the cost of asserting it here is
      // one line.
      if (!location.hash) smoother.scrollTo(0, false);

      // Child effects run before parent effects, so the ScrollTriggers in
      // ScrollPanel/Reveal were created before the smoother existed. create()
      // refreshes internally; this is the belt to that braces.
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

      /**
       * One delegated capture-phase listener instead of rewriting every anchor.
       *
       * Capture on `document` fires before React's delegated bubble-phase
       * dispatch, so preventDefault lands first. next/link checks
       * `defaultPrevented` only AFTER invoking the element's own onClick, so
       * the mobile menu's `setOpen(false)` still runs. Never stopPropagation
       * here — that is exactly what would break those handlers.
       */
      const onClick = (e: MouseEvent) => {
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }
        const a = (e.target as Element | null)?.closest?.("a");
        const href = a?.getAttribute("href");
        if (!href) return;

        /**
         * Two shapes reach here: a bare `#id` (every in-page control — nav,
         * CTAs, pillar/service cards) and `/#id` (footer links, which have to
         * work from a subpage too, so they carry a real path). Off the
         * homepage `/#id` must fall through to an ordinary Next navigation —
         * there's no `#id` element on `/about` or `/services/x` to jump to,
         * only one to land on after routing back to `/`. On the homepage the
         * two shapes are the same click and get the same smooth scroll.
         */
        const onHome = location.pathname === "/";
        const hash =
          href[0] === "#"
            ? href
            : onHome && href.startsWith("/#")
              ? href.slice(1)
              : null;
        if (!hash || hash.length < 2) return;
        // getElementById sidesteps CSS.escape concerns with odd ids.
        const target = document.getElementById(hash.slice(1));
        if (!target) return;
        e.preventDefault();

        /**
         * Not `smoother.scrollTo(target, true, …)`. With the smoother running
         * (i.e. not paused) that call takes the branch that writes the native
         * scroll position in one go and leaves ScrollSmoother's own lerp to
         * catch up — which, over a jump of several thousand pixels, arrives as
         * a lurch rather than a scroll. Tweening the smoother's scrollTop is
         * the same thing GSAP itself does on its paused branch, and it gives
         * an easing curve and a duration we control.
         */
        const to = smoother.offset(target, `top ${navOffset()}px`);
        gsap.to(smoother, {
          scrollTop: to,
          // Distance-scaled: a jump to the next section should not take as
          // long as a jump to the footer, and neither should crawl.
          duration: gsap.utils.clamp(
            0.6,
            1.4,
            Math.abs(to - smoother.scrollTop()) / 2200,
          ),
          ease: "power2.inOut",
          overwrite: true,
        });
        history.pushState(null, "", href);
      };

      document.addEventListener("click", onClick, true);

      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("click", onClick, true);
        // useGSAP reverts tweens and triggers, but not the smoother instance.
        smoother.kill();
      };
    });

    return () => mm.revert();
  }, {});

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content">{children}</div>
    </div>
  );
}
