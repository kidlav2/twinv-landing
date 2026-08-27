import Image from "next/image";

/**
 * A picture of the project, not a card of its metrics. Three CSS frames until
 * a real screenshot lands in `item.image` — then this component swaps to that
 * file and the drawings stay as the fallback.
 *
 * Deliberately not a browser chrome (traffic-light dots) and not the About
 * laptop: both of those are already a look, and wrapping every case in the
 * same device would make the work interchangeable. Each still is a different
 * kind of page, drawn in the site's own surfaces.
 *
 * The still is imagery. Type inside it is not a page heading — `font-display`
 * here is allowed below the 48px floor because it is a drawing of a site,
 * and the wrapper is `aria-hidden` so none of it enters the accessibility
 * tree. No buttons, no links: the still sits inside a chapter that is itself
 * the link.
 *
 * `@container` lives on the outer frame so `cqi` on the drawings tracks the
 * still's width, not some ancestor further up the page.
 */

const THREE = [0, 1, 2] as const;

function SaasStill() {
  return (
    <div className="bg-carbon text-paper flex h-full min-h-0 flex-col justify-between p-[8%]">
      <div>
        <p className="font-mono text-[clamp(0.5rem,2.2cqi,0.7rem)] uppercase opacity-50">
          Product
        </p>
        <p className="font-display mt-[0.25em] text-[clamp(1.6rem,9cqi,3.75rem)] leading-[0.9]">
          One job
        </p>
        <span className="bg-mint text-carbon rounded-tag mt-[1em] inline-block px-3 py-1 font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase">
          Start trial
        </span>
      </div>
      <div className="grid grid-cols-3 gap-[4%]">
        {THREE.map((i) => (
          <div key={i} className="bg-paper/10 rounded-btn aspect-[4/3] p-[12%]">
            <div className="h-[18%] w-[70%] rounded-sm bg-paper/25" />
            <div className="mt-[12%] h-[10%] w-full rounded-sm bg-paper/10" />
            <div className="mt-[8%] h-[10%] w-[80%] rounded-sm bg-paper/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreStill() {
  return (
    <div className="bg-paper flex h-full min-h-0 flex-col p-[8%]">
      <div className="bg-ash rounded-card-sm flex min-h-0 flex-1 items-end p-[8%]">
        <div className="bg-carbon rounded-btn h-[28%] w-[26%]" />
      </div>
      <div className="mt-[6%] flex items-end justify-between gap-[4%]">
        <span className="bg-ash h-[0.55em] w-[30%] rounded-sm" />
        <p className="font-display text-carbon text-[clamp(1.4rem,7cqi,2.5rem)] leading-none">
          48
        </p>
      </div>
      <div className="bg-carbon text-paper rounded-btn mt-[5%] py-[3.5%] text-center font-mono text-[clamp(0.5rem,2cqi,0.7rem)] uppercase">
        Add to bag
      </div>
    </div>
  );
}

function StudioStill() {
  return (
    <div className="bg-paper flex h-full min-h-0 p-[6%]">
      <div className="bg-canvas relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden rounded-card-sm p-[10%]">
        <span className="bg-voltage absolute top-[12%] right-[12%] size-[clamp(0.5rem,2.5cqi,0.85rem)] rounded-full" />
        <p className="font-display text-carbon text-[clamp(2rem,12cqi,5rem)] leading-[0.85]">
          Twin V
        </p>
        <p className="text-muted mt-[0.8em] max-w-[14ch] text-[clamp(0.6rem,2.4cqi,0.85rem)] leading-snug">
          Empty repo to live
        </p>
      </div>
    </div>
  );
}

function GenericStill() {
  return (
    <div className="bg-paper flex h-full min-h-0 flex-col justify-end p-[10%]">
      <div className="bg-carbon rounded-card-sm h-[38%] w-[54%]" />
    </div>
  );
}

function StillFor({ slug }: { slug: string }) {
  switch (slug) {
    case "saas-marketing-site":
      return <SaasStill />;
    case "storefront-performance":
      return <StoreStill />;
    case "studio-brand-launch":
      return <StudioStill />;
    default:
      return <GenericStill />;
  }
}

/**
 * `lg` is the case-study hero and is the only size that bleeds past the
 * gutter on a phone. The two index sizes must not: they sit in a grid whose
 * neighbours keep the gutter, and one tile breaking the margin reads as a
 * layout bug rather than a full-bleed image.
 *
 * Both index sizes are 3:2 and differ only in `sizes`. The index's wide slot
 * earns its width by putting the caption beside the picture, not by running
 * the picture edge to edge — a full-bleed 16:10 on a 1900px monitor is 1100px
 * tall, which is a screen and a half of one project on a page listing several.
 *
 * `sizes` is per-slot rather than one shared string. It is what decides which
 * file the browser downloads, so a wrong value costs real bytes on the one
 * page that is now mostly photography.
 */
const FRAME = {
  lg: "aspect-[4/3] w-full max-lg:-mx-[var(--shell-padding)] max-lg:w-[calc(100%+var(--shell-padding)*2)] max-lg:rounded-none",
  wide: "aspect-[3/2] w-full",
  tile: "aspect-[3/2] w-full",
} as const;

const SIZES = {
  lg: "(min-width: 1024px) 58vw, 100vw",
  wide: "(min-width: 1024px) 56vw, 100vw",
  tile: "(min-width: 1024px) 48vw, 100vw",
} as const;

export function WorkStill({
  slug,
  image,
  size = "lg",
  className = "",
}: {
  slug: string;
  image?: string;
  size?: keyof typeof FRAME;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`@container rounded-card relative overflow-hidden ${FRAME[size]} ${className}`}
    >
      {/* The scale lives on this inner layer, not on the link: the link is a
          `.reveal` target and GSAP writes `transform` on those, so a Tailwind
          `scale-*` up there would multiply against the reveal instead of
          replacing it. Clipped by the frame's overflow, and `motion-safe`
          means reduced-motion users get a still picture. */}
      <div className="motion-safe:group-hover:scale-[1.03] relative h-full w-full transition-transform duration-500 ease-out">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes={SIZES[size]}
            className="object-cover"
          />
        ) : (
          <StillFor slug={slug} />
        )}
      </div>
    </div>
  );
}
