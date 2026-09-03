import Image from "next/image";
import Link from "next/link";
import type { WorkCase, WorkTileItem } from "@/lib/work";
import { Tag } from "./ui";
import { WorkStill } from "./work-still";

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
function Kicker({ item }: { item: WorkTileItem | WorkCase }) {
  const lead = item.kind === "self" ? "Self-initiated" : item.sector;
  return (
    <p className="text-faint font-mono text-caption uppercase">
      {lead} · {item.year}
      {item.client ? (
        <>
          {" · "}
          <span className="bg-voltage text-carbon px-1">{item.client}</span>
        </>
      ) : (
        ""
      )}
    </p>
  );
}

/* No "View project →" affordance on any of these. The whole surface is the
   link, and the site already took that arrow back off the service cards for
   the same reason — a card that is entirely clickable does not need a smaller
   thing inside it claiming to be the click target. */

/** Compact card — the homepage teaser track.
 *
 *  Height is the rest layout and never changes, and neither does the position
 *  of anything the visitor reads. The title sits in normal flow under the
 *  still and stays there; hovering only cross-fades the still for the kicker
 *  and summary, inside the image box. Both of those are out of flow, so
 *  neither can shove the title or the tag.
 *
 *  This replaced a version that slid the title and summary up by the full
 *  height of the image on hover — see the note in globals.css. */
export function WorkCard({ item }: { item: WorkCase }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      data-card
      className="reveal work-card work-card-teaser bg-paper rounded-card flex w-[85vw] shrink-0 snap-start flex-col overflow-hidden sm:w-[420px]"
    >
      <div className="work-card-pin">
        <div className="work-card-still">
          <div className="work-card-still-inner">
            {item.image ? (
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 640px) 420px, 85vw"
                className="object-cover"
              />
            ) : (
              <WorkStill
                slug={item.slug}
                image={item.image}
                size="lg"
                bleed={false}
                className="rounded-none"
              />
            )}
          </div>
        </div>
        <div className="work-card-reveal justify-between p-6">
          <Kicker item={item} />
          <p className="text-muted text-pretty text-body leading-[1.45]">
            {item.summary}
          </p>
        </div>
      </div>

      {/* The real title now, not a spacer — it is what stays put. */}
      <div className="px-6 pt-6">
        <h3 className="work-card-title font-display text-heading-sm">
          {item.title}
        </h3>
      </div>

      <div className="work-card-foot px-6 pt-4 pb-6">
        <Tag className="self-start">{item.type}</Tag>
      </div>
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
  item: WorkTileItem;
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
        {item.type ? <Tag>{item.type}</Tag> : null}
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
  reveal = true,
}: {
  item: WorkTileItem;
  feature?: boolean;
  className?: string;
  reveal?: boolean;
}) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className={`${reveal ? "reveal " : ""}group flex flex-col ${
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
