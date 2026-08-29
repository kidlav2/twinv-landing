import { work } from "@/lib/content";
import { WorkStill } from "./work-still";

type LiveItem = {
  slug: string;
  url: string;
  image: string;
};

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The case-study still as the live site, not as a picture of it.
 *
 * Not Mac traffic-lights: work-still already refused those, and wrapping
 * every case in the same device chrome would make the work interchangeable.
 * The strip is the destination — hostname in mono, mint because mint is the
 * link colour — so a tap on a phone has somewhere labeled to land, and a
 * hover is only confirmation. The whole frame is the link; WorkStill stays
 * `aria-hidden` so the drawing inside does not also enter the tree.
 */
export function WorkLive({
  item,
  className = "",
  reveal = true,
}: {
  item: LiveItem;
  className?: string;
  /** Hub stage already owns entrance; a nested `.reveal` would pre-hide
   *  the still and freeze it if the swap remounts off the original batch. */
  reveal?: boolean;
}) {
  const host = hostOf(item.url);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${work.visit} ${host}`}
      className={`${reveal ? "reveal " : ""}group block max-lg:-mx-[var(--shell-padding)] max-lg:w-[calc(100%+var(--shell-padding)*2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${className}`}
    >
      <div className="rounded-card max-lg:rounded-none bg-carbon overflow-hidden">
        <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-3 sm:px-5">
          <span className="text-mint font-mono text-caption truncate">
            {host}
          </span>
          <span aria-hidden className="text-faint">
            ↗
          </span>
        </div>
        <WorkStill
          slug={item.slug}
          image={item.image}
          size="lg"
          bleed={false}
          className="rounded-none"
        />
      </div>
    </a>
  );
}
