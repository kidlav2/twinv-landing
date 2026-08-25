import Link from "next/link";
import { work } from "@/lib/content";
import { Tag } from "./ui";

type Item = (typeof work.items)[number];

/**
 * The line above the metric. It answers "whose was this" before the number
 * makes a claim, which is the order the claim has to survive in: a percentage
 * is only worth reading once you know there was a business under it.
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
 * The one loud element on the card, and the device the whole section is built
 * around: a number in display type with a mono line naming what it measures.
 *
 * The label is load-bearing rather than decorative. It is what lets `+142%`
 * and `1.1s` sit in the same slot on adjacent cards without the second one
 * borrowing the authority of the first — the reader is told which kind of
 * claim they are looking at, in the same breath as the figure.
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

/* No "View project →" affordance on either card. The whole surface is the
   link, and the site already took that arrow back off the service cards for
   the same reason — a card that is entirely clickable does not need a smaller
   thing inside it claiming to be the click target. The underline on the title
   carries hover and focus instead. */

/** Compact card — the homepage teaser track, where cards sit side by side in
 *  a fixed-width scroller. */
export function WorkCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      data-card
      className="reveal work-card bg-paper rounded-card group flex w-[85vw] shrink-0 snap-start flex-col p-8 sm:w-[420px]"
    >
      <Kicker item={item} />
      <div className="mt-8">
        <Metric item={item} />
      </div>
      <h3 className="font-display mt-8 text-heading-sm group-hover:underline group-focus-visible:underline underline-offset-[6px]">
        {item.title}
      </h3>
      <p className="text-muted mt-4 flex-1 text-body">{item.summary}</p>
      <div className="mt-8">
        <Tag>{item.type}</Tag>
      </div>
    </Link>
  );
}

/**
 * Wide row — the `/work` index.
 *
 * Deliberately not the compact card at a bigger size. With three projects a
 * multi-column grid leaves an orphan cell and treats every piece of work as
 * interchangeable; a stack of full-width rows reads as a record, holds its
 * shape at any count, and gives the metric a column of its own with a rule
 * beside it. Below `lg` the rule and the columns collapse and it becomes the
 * same vertical order as the compact card.
 */
export function WorkRow({ item }: { item: Item }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      className="reveal work-card bg-paper rounded-card group grid gap-8 p-8 sm:p-12 lg:grid-cols-12 lg:items-start lg:gap-12"
    >
      <div className="lg:border-line lg:col-span-4 lg:border-r lg:pr-12">
        <Kicker item={item} />
        <div className="mt-8">
          <Metric item={item} />
        </div>
      </div>

      <div className="lg:col-span-8">
        <h2 className="font-display max-w-[20ch] text-heading group-hover:underline group-focus-visible:underline underline-offset-[8px]">
          {item.title}
        </h2>
        {/* The site's paragraph size from `sm` up, but not on a phone:
            at 26.7px a three-sentence summary is most of a screen, and
            three rows of it turn a page about three projects into a very
            long scroll. */}
        <p className="text-muted mt-6 max-w-[52ch] text-body sm:text-lead">
          {item.summary}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Tag>{item.type}</Tag>
          <span className="text-faint font-mono text-caption uppercase">
            {item.role}
          </span>
        </div>
      </div>
    </Link>
  );
}
