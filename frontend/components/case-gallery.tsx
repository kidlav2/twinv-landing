"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "./reveal";
import { WorkStill } from "./work-still";

/**
 * Screenshots after the case timeline: one large frame plus a thumbnail
 * strip, not a cramped grid of five equal tiles. Clicking a thumbnail (or
 * an arrow) swaps the large frame; the active thumbnail stays at full
 * opacity so the current frame is always identifiable without a border
 * that would read as a shadow-adjacent affordance.
 *
 * Locked to one screen on desktop — heading row and thumbnail row are
 * `shrink-0`, and the picture takes whatever height is left. Phone drops the
 * lock and the picture runs full width at its own height.
 *
 * The large frame is a bare `<Image>`, not a `WorkStill`, and that is the
 * whole fix for the black bars. A still is a *frame* with a picture inside
 * it: a fixed 3:2 box painted `bg-carbon`, with the shot letterboxed in the
 * middle. The shots here are 0.46 to 2.17, so nearly every one of them sat
 * inside a black margin — on the sides for a tall capture, top and bottom for
 * a wide one. Sized from the file's own dimensions (`photos`, measured in
 * lib/image-size.ts) and capped by `max-h-full max-w-full`, the picture *is*
 * the element: it scales to fill whichever axis runs out first, nothing is
 * cropped, and there is no box left over to paint. Without a measurement it
 * falls back to the old still, mat and all.
 *
 * The first slot is always the hero shot; anything in `gallery` follows.
 */
export function CaseGallery({
  slug,
  shots,
  heading,
  photos = {},
}: {
  slug: string;
  shots: string[];
  heading: string;
  /** Pixel dimensions per public path, from the server. */
  photos?: Record<string, { w: number; h: number }>;
}) {
  const [active, setActive] = useState(0);

  if (!shots.length) return null;

  const count = shots.length;
  const go = (delta: number) => setActive((i) => (i + delta + count) % count);
  const photo = photos[shots[active]];

  return (
    <section className="max-lg:pb-section lg:h-svh">
      <Reveal className="shell flex h-full flex-col lg:pt-[calc(var(--nav-height)+12px)] lg:pb-8">
        <div className="flex shrink-0 items-end justify-between gap-6">
          <h2 className="reveal font-display text-heading-lg max-w-[12ch]">
            {heading}
          </h2>

          {count > 1 && (
            <div className="reveal flex shrink-0 items-center gap-3">
              <span className="text-faint font-mono text-caption uppercase">
                {active + 1} / {count}
              </span>
              <div className="flex gap-2">
                <ArrowButton direction="prev" onClick={() => go(-1)} />
                <ArrowButton direction="next" onClick={() => go(1)} />
              </div>
            </div>
          )}
        </div>

        {/* `flex-1` is scoped to `lg`, where it means something: it carries
            `flex-basis: 0`, and there is only free height to distribute
            inside the one-screen column above. Below `lg` the section is
            content-sized, so a basis-0 item alongside `min-h-0` has no
            height to be given — and the phone wants the ordinary block
            behaviour there anyway: full width, the picture's own height. */}
        <div className="reveal relative mt-8 flex min-h-0 items-center justify-center lg:flex-1">
          {photo ? (
            <Image
              key={`${shots[active]}-${active}`}
              src={shots[active]}
              alt=""
              width={photo.w}
              height={photo.h}
              sizes="(min-width: 1024px) 92vw, 100vw"
              className="rounded-card max-h-full w-auto max-w-full object-contain"
            />
          ) : (
            <WorkStill
              key={`${shots[active]}-${active}`}
              slug={slug}
              image={shots[active]}
              size="fit"
              bleed={false}
              fit="contain"
              className="bg-carbon"
            />
          )}

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous frame"
                className="text-paper/0 hover:text-paper/70 absolute inset-y-0 left-0 flex w-1/2 items-center justify-start pl-4 transition-colors focus-visible:text-paper/70"
              >
                <ChevronIcon direction="prev" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next frame"
                className="text-paper/0 hover:text-paper/70 absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-4 transition-colors focus-visible:text-paper/70"
              >
                <ChevronIcon direction="next" />
              </button>
            </>
          )}
        </div>

        {count > 1 && (
          <div className="mt-4 flex shrink-0 justify-center gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shots.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show frame ${i + 1}`}
                aria-current={i === active}
                className={`reveal w-24 shrink-0 transition-opacity sm:w-32 ${
                  i === active
                    ? "opacity-100"
                    : "opacity-45 hover:opacity-75"
                }`}
              >
                <WorkStill
                  slug={slug}
                  image={src}
                  size="tile"
                  bleed={false}
                />
              </button>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous frame" : "Next frame"}
      className="border-line text-faint hover:text-fg hover:border-fg flex size-11 items-center justify-center rounded-full border transition-colors"
    >
      <ChevronIcon direction={direction} className="size-4" />
    </button>
  );
}

/** Shared with the two invisible side-click zones on the large frame, which
 *  reuse it at a larger size as the hover affordance. */
function ChevronIcon({
  direction,
  className = "size-8",
}: {
  direction: "prev" | "next";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {direction === "prev" ? (
        <path d="M15 4.5 7.5 12l7.5 7.5" />
      ) : (
        <path d="M9 4.5 16.5 12 9 19.5" />
      )}
    </svg>
  );
}
