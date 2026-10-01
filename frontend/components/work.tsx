"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { work } from "@/lib/content";
import { teaserItems } from "@/lib/work";
import { Reveal } from "./reveal";
import { WorkCard } from "./work-card";

/**
 * Everything the track's controls need, measured rather than assumed.
 *
 * `pages` is the fix for a real bug: the dots used to be one per CARD, and
 * `scrollTo(i * step)` for the later ones ran past the end of the scroll
 * range and clamped. On a 27" monitor the track holds four cards at once and
 * can only travel 528px, so dots two through five all landed in the same
 * place and four of the five looked dead.
 *
 * A page is one card step. The last page is wherever the scroll runs out,
 * which is normally short of a full step — it counts as its own page only
 * when it is further than a gutter from the one before, otherwise two dots
 * sit a few pixels apart and both read as broken.
 */
function metrics(track: HTMLDivElement) {
  const card = track.querySelector<HTMLElement>("[data-card]");
  const step = card ? card.offsetWidth + 24 : track.clientWidth;
  const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
  const whole = Math.floor(maxScroll / step);
  const stub = maxScroll - whole * step;
  const pages = maxScroll <= 4 ? 1 : whole + (stub > 24 ? 2 : 1);
  return { step, maxScroll, pages };
}

/**
 * The homepage teaser. It shows the cards in `work.teaser`, not the full
 * index — the index owns the portfolio, and this section links to it. A
 * four-product engagement is one card, not four.
 */
export function Work() {
  const teasers = teaserItems();
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);
  const [pages, setPages] = useState(1);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { step, maxScroll, pages: count } = metrics(el);
    setAtStart(el.scrollLeft <= 4);
    // Sub-pixel widths make an exact comparison unreliable; allow a small slop.
    setAtEnd(el.scrollLeft >= maxScroll - 4);
    setPages(count);
    setActive(Math.min(Math.round(el.scrollLeft / step), count - 1));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * metrics(el).step, behavior: "smooth" });
  };

  const scrollToIndex = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    // Clamped: the last page is short of a full step, and an unclamped
    // target there scrolls to the same place as the one before it.
    const { step, maxScroll } = metrics(el);
    el.scrollTo({ left: Math.min(i * step, maxScroll), behavior: "smooth" });
  };

  return (
    <section id="work" className="py-section">
      <Reveal>
        <div className="shell">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="reveal font-display text-heading-lg">
                {work.headline}
              </h2>
              {/* The route, not the anchor. This is the only place on the
                  homepage that hands a visitor the full index, now that the
                  nav item points straight at it. */}
              <Link
                href="/work"
                className="reveal text-fg decoration-line hover:decoration-current mt-5 inline-flex items-center gap-2 text-body-sm font-medium underline underline-offset-4 transition-colors"
              >
                {work.more}
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="reveal flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={atStart}
                aria-label="Previous project"
                className="border-slate text-carbon hover:bg-carbon hover:text-paper flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:pointer-events-none disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={atEnd}
                aria-label="Next project"
                className="border-slate text-carbon hover:bg-carbon hover:text-paper flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:pointer-events-none disabled:opacity-30"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* No `justify-center` here. It used to centre a row that fitted, but
            the card is now a share of the track (see work-card.tsx), so three
            cards fill the row exactly and any fourth overflows. Centring an
            overflowing flex row splits the overhang to BOTH sides: the first
            card gets cut off before the scroll origin and cannot be scrolled
            back to. Measured at 2560 it left two cards whole instead of three
            and halved the scrollable range. */}
        <div
          ref={trackRef}
          className="mt-12 flex snap-x snap-mandatory items-stretch gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingInlineStart: "var(--shell-padding)",
            paddingInlineEnd: "var(--shell-padding)",
            /* Without this the first card sits flush against the window edge,
               72–96px left of the heading above it. `snap-mandatory` aligns a
               card's start edge to the SNAPPORT, and the snapport ignores the
               container's own padding — so the browser scrolled the track by
               exactly the gutter to satisfy the snap. `scroll-padding` is what
               moves the snapport inward, and the row lines up with the rest of
               the page again. */
            scrollPaddingInline: "var(--shell-padding)",
          }}
        >
          {teasers.map((item) => (
            <WorkCard key={item.slug} item={item} />
          ))}
        </div>

        {/* One dot per PAGE, not per card. The old version rendered
            `teasers.length` of them, which on a wide monitor meant five dots
            over two reachable positions — three of them scrolled nowhere and
            looked broken. `metrics()` counts what the track can actually stop
            on; when that is one, there is nothing to page and no dots. */}
        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-2" role="tablist">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? "bg-carbon w-6" : "bg-ash w-2"
                }`}
              />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
