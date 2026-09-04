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



function TaskStill() {
  return (
    <div className="bg-carbon text-paper flex h-full min-h-0 flex-col justify-between p-[8%]">
      <div>
        <p className="font-mono text-[clamp(0.5rem,2.2cqi,0.7rem)] uppercase opacity-50">
          Month 1
        </p>
        <p className="font-display mt-[0.25em] text-[clamp(1.6rem,9cqi,3.75rem)] leading-[0.9]">
          Get set up
        </p>
      </div>
      <div className="flex flex-col gap-[6%]">
        {THREE.map((i) => (
          <div
            key={i}
            className="bg-paper/10 rounded-btn flex items-center gap-[6%] p-[6%]"
          >
            <span
              className={`size-[clamp(0.6rem,3cqi,1rem)] shrink-0 rounded-full ${
                i === 0 ? "bg-mint" : "bg-paper/20"
              }`}
            />
            <div className="bg-paper/15 h-[0.6em] flex-1 rounded-sm" />
          </div>
        ))}
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

function VeloCultHubStill() {
  return (
    <div className="bg-carbon text-paper flex h-full min-h-0 flex-col justify-between p-[8%]">
      <p className="font-display text-[clamp(1.4rem,8cqi,3.25rem)] leading-[0.9]">
        One SaaS
      </p>
      <div className="grid grid-cols-3 gap-[4%]">
        {["SaaS", "Website", "CRM"].map((label) => (
          <div
            key={label}
            className="bg-paper/10 rounded-btn aspect-[4/3] p-[14%] flex flex-col justify-end"
          >
            <p className="font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase opacity-70">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VeloCultSiteStill() {
  return (
    <div className="bg-paper flex h-full min-h-0 flex-col p-[8%]">
      <div className="flex gap-[3%]">
        {["Buy", "Rent", "Fix"].map((label) => (
          <span
            key={label}
            className="bg-ash rounded-tag px-3 py-1 font-mono text-[clamp(0.4rem,1.6cqi,0.6rem)] uppercase"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="bg-ash rounded-card-sm mt-[8%] min-h-0 flex-1 p-[8%]">
        <div className="bg-carbon rounded-btn h-[18%] w-[42%]" />
        <div className="bg-paper mt-[10%] h-[12%] w-full rounded-sm" />
        <div className="bg-paper mt-[6%] h-[12%] w-[70%] rounded-sm" />
      </div>
    </div>
  );
}

function VeloCultCatalogStill() {
  return (
    <div className="bg-paper flex h-full min-h-0 flex-col p-[8%]">
      <div className="flex justify-between font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase">
        <span>/bikes</span>
        <span className="text-muted">/shop</span>
      </div>
      <div className="mt-[6%] grid min-h-0 flex-1 grid-cols-2 gap-[4%]">
        <div className="bg-carbon rounded-btn" />
        <div className="bg-ash rounded-btn" />
        <div className="bg-ash rounded-btn" />
        <div className="bg-carbon rounded-btn" />
      </div>
    </div>
  );
}

function VeloCultCrmStill() {
  return (
    <div className="bg-canvas flex h-full min-h-0 flex-col p-[8%]">
      <p className="font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase opacity-50">
        Queue
      </p>
      <div className="mt-[6%] flex min-h-0 flex-1 flex-col gap-[5%]">
        {["Rent", "Service", "Parts"].map((label, i) => (
          <div
            key={label}
            className="bg-paper rounded-btn flex flex-1 items-center justify-between px-[6%]"
          >
            <span className="font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase">
              {label}
            </span>
            <span
              className={`size-[0.55em] rounded-full ${
                i === 0 ? "bg-voltage" : "bg-ash"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function VeloCultAndroidStill() {
  return (
    <div className="bg-canvas flex h-full min-h-0 items-center justify-center p-[10%]">
      <div className="bg-carbon text-paper rounded-card flex h-full w-[42%] min-w-[5rem] flex-col justify-between p-[12%]">
        <span className="bg-mint size-[clamp(0.4rem,1.5cqi,0.55rem)] rounded-full" />
        <p className="font-display text-[clamp(1rem,5cqi,1.75rem)] leading-none">
          Floor
        </p>
      </div>
    </div>
  );
}

function SaasProductHubStill() {
  return (
    <div className="bg-carbon text-paper flex h-full min-h-0 flex-col justify-between p-[8%]">
      <p className="font-display text-[clamp(1.4rem,8cqi,3.25rem)] leading-[0.9]">
        One record
      </p>
      <div className="grid grid-cols-2 gap-[4%]">
        {["Site", "App", "Landing", "Bot"].map((label) => (
          <div
            key={label}
            className="bg-paper/10 rounded-btn aspect-[4/3] p-[14%] flex flex-col justify-end"
          >
            <p className="font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase opacity-70">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SaasProductAppStill() {
  return (
    <div className="bg-canvas flex h-full min-h-0 items-center justify-center p-[10%]">
      <div className="bg-carbon text-paper rounded-card flex h-full w-[42%] min-w-[5rem] flex-col justify-between p-[12%]">
        <span className="bg-mint size-[clamp(0.4rem,1.5cqi,0.55rem)] rounded-full" />
        <p className="font-display text-[clamp(1rem,5cqi,1.75rem)] leading-none">
          App
        </p>
      </div>
    </div>
  );
}

function SaasProductLandingStill() {
  return (
    <div className="bg-paper flex h-full min-h-0 flex-col justify-between p-[8%]">
      <div>
        <p className="font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase opacity-50">
          Campaign
        </p>
        <p className="font-display text-carbon mt-[0.4em] text-[clamp(1.4rem,8cqi,3rem)] leading-[0.9]">
          Start trial
        </p>
      </div>
      <div className="bg-carbon text-paper rounded-btn py-[4%] text-center font-mono text-[clamp(0.5rem,2cqi,0.7rem)] uppercase">
        Continue
      </div>
    </div>
  );
}

function SaasProductTgbotStill() {
  return (
    <div className="bg-canvas flex h-full min-h-0 flex-col justify-end gap-[6%] p-[10%]">
      <div className="bg-paper rounded-btn self-start px-[8%] py-[5%] font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase">
        Trial?
      </div>
      <div className="bg-carbon text-paper rounded-btn self-end px-[8%] py-[5%] font-mono text-[clamp(0.45rem,1.8cqi,0.65rem)] uppercase">
        Same account
      </div>
      <span className="bg-voltage size-[clamp(0.4rem,1.5cqi,0.55rem)] self-end rounded-full" />
    </div>
  );
}

function StillFor({ slug }: { slug: string }) {
  switch (slug) {
    case "petpassport-website":
      return <SaasStill />;
    case "velocult":
      return <VeloCultHubStill />;
    case "velocult-site":
      return <VeloCultSiteStill />;
    case "velocult-catalog":
      return <VeloCultCatalogStill />;
    case "velocult-crm":
      return <VeloCultCrmStill />;
    case "velocult-android":
      return <VeloCultAndroidStill />;
    case "saas-product":
      return <SaasProductHubStill />;
    case "petpassport":
      return <SaasProductHubStill />;
    case "saas-product-app":
      return <SaasProductAppStill />;
    case "petpassport-app":
      return <SaasProductAppStill />;
    case "saas-product-landing":
      return <SaasProductLandingStill />;
    case "petpassport-landing":
      return <SaasProductLandingStill />;
    case "saas-product-tgbot":
      return <SaasProductTgbotStill />;
    case "petpassport-tgbot":
      return <SaasProductTgbotStill />;
    case "arrivalio":
      return <TaskStill />;
    default:
      return <GenericStill />;
  }
}

/**
 * `lg` is the case-study still. Alone it bleeds past the gutter on a phone;
 * inside WorkLive the wrapper does that, and `bleed={false}` keeps this
 * frame from doing it twice. The two index sizes must never bleed: they sit
 * in a grid whose neighbours keep the gutter.
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
  lg: "aspect-[4/3] w-full",
  /** The case-page hero, inside WorkLive's browser chrome. 16:9 and paired
   *  with `fit="contain"` at the call site, because the sources are not one
   *  shape: the screenshots on this site run from 1.50 to 2.01, and a phone
   *  shot is 0.46. Cropping a spread that wide to a fixed frame cuts real
   *  interface — a 1.50 screenshot in the old 4:3 frame lost 11% off each
   *  side, which on a CRM is exactly where the sidebar and the totals panel
   *  live. Contain never cuts; the leftover is carbon inside carbon chrome,
   *  so it reads as a mat rather than a gap. */
  hero: "aspect-[16/9] w-full",
  wide: "aspect-[3/2] w-full",
  tile: "aspect-[3/2] w-full",
  full: "aspect-[3/2] w-full",
  /** Case gallery on a monitor: phone keeps 3:2; desktop fills the cell. */
  fit: "aspect-[3/2] w-full lg:aspect-auto lg:h-full lg:min-h-0",
} as const;

/** Case-page still, used alone. When the still sits inside WorkLive the
 *  wrapper already cancels the gutter, so this must not run a second time. */
const BLEED =
  "max-lg:-mx-[var(--shell-padding)] max-lg:w-[calc(100%+var(--shell-padding)*2)] max-lg:rounded-none";

const SIZES = {
  lg: "(min-width: 1024px) 58vw, 100vw",
  hero: "(min-width: 1024px) 58vw, 100vw",
  wide: "(min-width: 1024px) 56vw, 100vw",
  tile: "(min-width: 1024px) 48vw, 100vw",
  full: "(min-width: 1024px) 92vw, 100vw",
  fit: "(min-width: 1024px) 92vw, 100vw",
} as const;

export function WorkStill({
  slug,
  image,
  size = "lg",
  bleed,
  fit = "cover",
  className = "",
}: {
  slug: string;
  image?: string;
  size?: keyof typeof FRAME;
  /** Phone gutter-break. Defaults on for `lg` (a lone case-study still) and
   *  off for the index sizes, which sit inside a grid that already owns the
   *  margin. Pass false when a parent (WorkLive) is the thing that bleeds. */
  bleed?: boolean;
  /** `cover` fills the frame and crops — right for a card/tile whose frame
   *  sets the aspect ratio. `contain` never crops, for a frame (like the
   *  case gallery's `fit` size) whose own aspect ratio is arbitrary and
   *  where the point is seeing the whole screenshot. */
  fit?: "cover" | "contain";
  className?: string;
}) {
  const phoneBleed = bleed ?? size === "lg";

  return (
    <div
      aria-hidden
      className={`@container rounded-card relative overflow-hidden ${FRAME[size]} ${
        phoneBleed ? BLEED : ""
      } ${className}`}
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
            className={fit === "contain" ? "object-contain" : "object-cover"}
          />
        ) : (
          <StillFor slug={slug} />
        )}
      </div>
    </div>
  );
}
