import Image from "next/image";
import Link from "next/link";
import { work } from "@/lib/content";
import { Tag } from "./ui";
import { WorkStill } from "./work-still";

type Item = (typeof work.items)[number];

/**
 * The line that opens a card. It answers "whose was this, and when" before
 * anything below makes a claim, which is the order the claim has to survive
 * in.
 *
 * Self-initiated work leads with that fact rather than with its sector — not
 * as a disclaimer, but because "we built this ourselves" is the honest frame
 * and a visitor who finds it out later stops believing the rest of the page.
 * See the rules on `kind` in lib/content.ts.
 */
function Kicker({ item }: { item: Item }) {
  const lead = item.kind === "self" ? "Self-initiated" : item.sector;
  return (
    <p className="text-faint font-mono text-caption uppercase">
      {lead} · {item.year}
    </p>
  );
}

/**
 * The loud face of the teaser's hover state: a number in display type with a
 * mono line naming what it measures.
 *
 * The label is load-bearing rather than decorative. It is what lets `+142%`
 * and `1.1s` sit in the same slot on adjacent cards without the second one
 * borrowing the authority of the first — the reader is told which kind of
 * claim they are looking at, in the same breath as the figure.
 *
 * Only the teaser uses this. The `/work` index deliberately does not — see
 * the note on `metric` in lib/content.ts.
 */
function Metric({ item }: { item: Item }) {
  return (
    <div>
      <p className="font-display text-display leading-none">
        {item.metric.value}
      </p>
      <p className="text-faint mt-3 font-mono text-caption uppercase">
        {item.metric.label}
      </p>
    </div>
  );
}

/* No "View project →" affordance on any of these. The whole surface is the
   link, and the site already took that arrow back off the service cards for
   the same reason — a card that is entirely clickable does not need a smaller
   thing inside it claiming to be the click target. */

function TeaserRest({ item }: { item: Item }) {
  return (
    <div className="work-card-rest flex h-full flex-col">
      <div className="bg-ash relative min-h-0 flex-1 overflow-hidden">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(min-width: 640px) 420px, 85vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-4 p-6">
        <h3 className="font-display text-heading-sm">{item.title}</h3>
        <Tag className="self-start">{item.type}</Tag>
      </div>
    </div>
  );
}

function TeaserHover({ item }: { item: Item }) {
  return (
    <div className="work-card-hover flex h-full flex-col p-8">
      <Kicker item={item} />
      <div className="mt-8">
        <Metric item={item} />
      </div>
      <h3 className="font-display mt-8 text-heading-sm">{item.title}</h3>
      <p className="text-muted mt-4 flex-1 text-body">{item.summary}</p>
      <div className="mt-8">
        <Tag>{item.type}</Tag>
      </div>
    </div>
  );
}

/** Compact card — the homepage teaser track.
 *
 *  At rest it is the still: photo, title, type. On hover it becomes the
 *  previous card — kicker, metric, title, summary, tag — the two faces share
 *  one grid cell so the track does not jump when the swap happens. */
export function WorkCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      data-card
      className="reveal work-card work-card-teaser bg-paper rounded-card w-[85vw] shrink-0 snap-start overflow-hidden sm:w-[420px]"
    >
      <TeaserRest item={item} />
      <TeaserHover item={item} />
    </Link>
  );
}

/**
 * The caption under an index tile: who and when, what it was, one sentence,
 * and the outcome tag. No headline figure — see the note on `metric` in
 * lib/content.ts for why the index does not carry one.
 *
 * The summary runs at `text-body` (or `text-sub` in the feature slot) rather
 * than the site's `text-lead` paragraph size. That rule is about blocks of
 * paragraph copy; this is a single-sentence caption sitting under an image,
 * and at 26.7px it out-shouts the title it belongs to.
 */
function Caption({
  item,
  feature,
  className = "",
}: {
  item: Item;
  feature: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${feature ? "mt-8" : "mt-6"} flex flex-1 flex-col ${className}`}
    >
      <Kicker item={item} />
      {/* h2: the index has only its masthead above these. */}
      <h2
        className={`font-display mt-4 group-hover:underline group-focus-visible:underline underline-offset-[6px] ${
          feature ? "max-w-[22ch] text-heading" : "max-w-[24ch] text-heading-sm"
        }`}
      >
        {item.title}
      </h2>
      <p
        className={`text-muted mt-4 max-w-[52ch] ${
          feature ? "text-sub" : "text-body"
        }`}
      >
        {item.summary}
      </p>
      {/* Pushed to the bottom of the caption, not spaced off the summary.
          Summaries wrap to two or three lines depending on the entry, and a
          row of tiles whose tags each land at a different height reads as
          three unrelated blocks rather than one row. */}
      <div className="mt-auto pt-6">
        <Tag>{item.type}</Tag>
      </div>
    </div>
  );
}

/**
 * The `/work` index tile.
 *
 * Deliberately not a white card like the teaser: a screenshot already has its
 * own surface, and boxing it inside `bg-paper` puts a frame around a frame.
 * Picture on canvas, caption below it, and the text is never hidden behind a
 * hover — the index is a list you scan, not one you have to interrogate card
 * by card.
 *
 * `feature` is the wide slot the index hands to the first project when the
 * count is odd. It spends that width sideways — picture in seven columns, the
 * same caption beside it in five — rather than on a taller picture. Same
 * fields in the same order, so it is a rhythm change rather than a second kind
 * of card, which is what lets the page hold its shape at three projects and at
 * twenty. See app/work/page.tsx. Below `lg` it is an ordinary tile.
 */
export function WorkTile({
  item,
  feature = false,
  className = "",
}: {
  item: Item;
  feature?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className={`reveal group flex flex-col ${
        feature ? "lg:grid lg:grid-cols-12 lg:items-center lg:gap-12" : ""
      } ${className}`}
    >
      <WorkStill
        slug={item.slug}
        image={item.image}
        size={feature ? "wide" : "tile"}
        className={feature ? "lg:col-span-7" : ""}
      />
      <Caption
        item={item}
        feature={feature}
        className={feature ? "lg:col-span-5 lg:mt-0" : ""}
      />
    </Link>
  );
}
