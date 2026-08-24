"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cases } from "@/lib/content";
import { Tag } from "./ui";
import { Reveal } from "./reveal";

function cardStep(track: HTMLDivElement) {
  const card = track.querySelector<HTMLElement>("[data-card]");
  return card ? card.offsetWidth + 24 : track.clientWidth;
}

export function Cases() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);
  // On a wide viewport all cards fit centered and there's nothing to scroll
  // to — dots implying otherwise (and a stuck "card 1 active" state) would be
  // dishonest, so they only render once scrolling is actually possible.
  const [scrollable, setScrollable] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    // Sub-pixel widths make an exact comparison unreliable; allow a small slop.
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
    setActive(Math.round(el.scrollLeft / cardStep(el)));
    setScrollable(el.scrollWidth - el.clientWidth > 4);
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
            <h2 className="reveal font-display text-heading-lg">
              {cases.headline}
            </h2>

            <div className="reveal flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={atStart}
                aria-label="Previous case"
                className="border-slate text-carbon hover:bg-carbon hover:text-paper flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:pointer-events-none disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={atEnd}
                aria-label="Next case"
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
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] lg:justify-center [&::-webkit-scrollbar]:hidden"
          style={{
            paddingInlineStart: "var(--shell-padding)",
            paddingInlineEnd: "var(--shell-padding)",
          }}
        >
          {cases.items.map((c) => (
            <article
              key={c.title}
              data-card
              className="reveal bg-paper rounded-card flex w-[85vw] shrink-0 snap-start flex-col p-8 sm:w-[420px]"
            >
              <p className="font-display text-display leading-none">
                {c.metric}
              </p>
              <h3 className="font-display mt-6 text-heading-sm">{c.title}</h3>
              <p className="text-muted mt-4 flex-1 text-body">{c.body}</p>
              <div className="mt-8">
                <Tag>{c.tag}</Tag>
              </div>
            </article>
          ))}
        </div>

        {scrollable && cases.items.length > 1 && (
          <div className="mt-8 flex justify-center gap-2" role="tablist">
            {cases.items.map((c, i) => (
              <button
                key={c.title}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to case ${i + 1}`}
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
