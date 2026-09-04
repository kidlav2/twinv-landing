"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { work } from "@/lib/content";
import { teaserItems } from "@/lib/work";
import { Reveal } from "./reveal";
import { WorkCard } from "./work-card";

function cardStep(track: HTMLDivElement) {
  const card = track.querySelector<HTMLElement>("[data-card]");
  return card ? card.offsetWidth + 24 : track.clientWidth;
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

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    // Sub-pixel widths make an exact comparison unreliable; allow a small slop.
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
    setActive(Math.round(el.scrollLeft / cardStep(el)));
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
    el.scrollBy({ left: dir * cardStep(el), behavior: "smooth" });
  };

  const scrollToIndex = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * cardStep(el), behavior: "smooth" });
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

        {/* `lg:justify-center` only takes effect once the row is narrower than
            the track — with 3 cards it fits and centres on a normal desktop
            width; on anything narrower the cards overflow and this has no
            effect, so the native scroll/snap behaviour is unchanged there. */}
        <div
          ref={trackRef}
          className="mt-12 flex snap-x snap-mandatory items-stretch gap-6 overflow-x-auto pb-4 [scrollbar-width:none] lg:justify-center [&::-webkit-scrollbar]:hidden"
          style={{
            paddingInlineStart: "var(--shell-padding)",
            paddingInlineEnd: "var(--shell-padding)",
          }}
        >
          {teasers.map((item) => (
            <WorkCard key={item.slug} item={item} />
          ))}
        </div>

        {/* Always rendered, which is a deliberate exception rather than an
            oversight. These used to appear only once the row actually
            overflowed, on the argument that a pager promising pages that do
            not exist is dishonest. Three 420px cards fit whole from about
            1600px wide, so on a large monitor the dots vanished and the
            section stopped reading as something you could page through at
            all — which is its own kind of wrong, and the one a visitor
            actually notices. Asked for explicitly; the arrows above still
            disable themselves honestly at either end. */}
        {teasers.length > 1 && (
          <div className="mt-8 flex justify-center gap-2" role="tablist">
            {teasers.map((item, i) => (
              <button
                key={item.slug}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to project ${i + 1}`}
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
