"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { product } from "@/lib/content";
import { ButtonPrimary } from "./ui";
import { isDocumentVisible, WORD_SCRUB_OK } from "@/lib/motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Product's body copy, lit word by word as the column scrolls through.
 *
 * This component holds no state and must never re-render: SplitText rewrites
 * the paragraphs' innerHTML, and a React re-render would replace that DOM with
 * the original markup while GSAP still held references to the word spans.
 *
 * It owns the CTA as well as the paragraphs, because the button is the last
 * beat of the same timeline.
 */
export function ProductCopy() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const col = scope.current;
      if (!col) return;

      const mm = gsap.matchMedia();

      mm.add(WORD_SCRUB_OK, () => {
        // First line, above SplitText.create — same rule as reveal.tsx. A
        // scrub only advances on scroll events, which a background tab never
        // sends, so starting the words at 0.18 there would leave the copy
        // permanently dimmed. Bail and the natural full-opacity text stands.
        if (!isDocumentVisible()) return;

        const paragraphs = col.querySelectorAll("[data-pw-copy]");
        const cta = col.querySelector<HTMLElement>("[data-pw-cta]");
        if (!paragraphs.length) return;

        let refreshQueued = false;
        let scrub: gsap.core.Timeline | null = null;

        const split = SplitText.create(paragraphs, {
          type: "words",
          // A <div> inside a <p> is invalid markup and browsers will hoist it
          // out of the paragraph, so the split must use spans.
          tag: "span",
          // Without this a screen reader is handed ~60 loose word fragments
          // instead of two sentences.
          aria: "auto",
          wordsClass: "pw",
          // Worth knowing: SplitText only attaches autoSplit's resize observer
          // and font-load listener when the split includes lines (see the
          // `splitLines && autoSplit &&` guards in SplitText.js). A words-only
          // split like this one therefore fires onSplit exactly once. Kept
          // because it costs nothing and is correct if `type` ever gains
          // lines — but do not read it as "this re-splits".
          autoSplit: true,
          onSplit: (self) => {
            // Built inside onSplit and returned, so SplitText owns it: it
            // stores the animation and reverts it along with the markup. A
            // trigger created outside would outlive a revert and keep
            // pointing at word spans that no longer exist.
            const tl = (scrub = gsap.timeline({
              scrollTrigger: {
                trigger: col,
                start: "top 78%",
                // Not "+=80vh": the column is only ~500px tall, so a fixed
                // distance finishes the last word just as the column leaves
                // the top of the screen — the CTA would light up off-camera.
                end: "bottom 60%",
                scrub: 0.15,
                invalidateOnRefresh: true,
              },
            }));

            // Opacity, not colour. The words inherit `text-fg`, which is
            // #ffffff inside the dark zone, so 0.18 on black resolves to
            // ~#2e2e2e — the graphite the design system already has a token
            // for, arrived at through the tone system with no hex in sight.
            // GSAP cannot interpolate `var(--color-line)` anyway, and opacity
            // is cheaper. No will-change: 60 promoted layers is exactly what
            // reveal.tsx was rewritten to stop doing.
            //
            // `set` first, then a plain `to` — NOT a staggered `fromTo`.
            // Measured: inside a scrubbed timeline a staggered fromTo applies
            // its from-value per target as that target's turn begins, so every
            // word sat at full opacity, dropped to 0.18 the instant its own
            // sub-tween started, and lit back up. Fifty-eight little flashes
            // instead of one sweep. Setting all the words dim up front leaves
            // the tween nothing to surprise anyone with.
            gsap.set(self.words, { opacity: 0.18 });
            tl.to(self.words, {
              opacity: 1,
              ease: "none",
              // An overall spread, not a per-word delay, so editing the
              // copy changes how much is said and not how fast it reads.
              stagger: { amount: 4 },
            });

            if (cta) {
              // Same reason as the words above.
              gsap.set(cta, { opacity: 0 });
              tl.to(cta, { opacity: 1, ease: "none", duration: 0.4 }, ">-0.1");
            }

            // Fonts load through next/font with display: swap, so the text
            // changes height after first paint and moves every trigger below
            // it. Deferred to the next frame because calling refresh()
            // synchronously from here can re-enter one already in progress.
            if (!refreshQueued) {
              refreshQueued = true;
              requestAnimationFrame(() => {
                refreshQueued = false;
                ScrollTrigger.refresh();
              });
            }

            return tl;
          },
        });

        /**
         * Not in the plan, added on inspection: the CTA starts at opacity 0,
         * and focus can reach it before scroll has run the scrub — an
         * invisible focused button, whose focus ring is invisible too because
         * opacity fades that as well. Completing the timeline on focus costs
         * nothing; the next scroll event hands control straight back to the
         * scrub.
         */
        const onFocusIn = () => scrub?.progress(1);
        cta?.addEventListener("focusin", onFocusIn);

        return () => {
          cta?.removeEventListener("focusin", onFocusIn);
          // mm.revert() reverts tweens; it does not put the innerHTML back.
          split.revert();
          // The context should already have restored this, since the gsap.set
          // above ran inside it. Cleared by hand anyway because this is the
          // one property whose leak is not cosmetic: a CTA stuck at opacity 0
          // is an invisible button. One line against a silent dead end.
          cta?.style.removeProperty("opacity");
        };
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope}>
      {/* No `.reveal` on these any more. The batch writes opacity on the
          paragraph while the scrub writes it on the word spans inside, and
          the two values multiply — the copy would arrive dimmer than either
          animation intended. `.reveal` stays on the h2 and the image column,
          which nothing else animates. */}
      {product.body.map((p) => (
        <p key={p} data-pw-copy className="text-fg mt-6 text-lead">
          {p}
        </p>
      ))}
      <div data-pw-cta className="mt-10">
        <ButtonPrimary href={product.cta.href}>
          {product.cta.label}
        </ButtonPrimary>
      </div>
    </div>
  );
}
