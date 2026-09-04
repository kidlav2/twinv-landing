/**
 * One mark per service, sitting in the empty right-hand half of a service
 * card. On a 27" monitor those cards are 773px wide and hold a title and a
 * single line of body — roughly five hundred pixels of nothing each, six times
 * over. The mark is what that width is for.
 *
 * Two colours and no more, which is a palette decision rather than a drawing
 * one:
 *
 *   currentColor — the frames and the mass. It is `text-fg`, so it is black on
 *                  the canvas and turns white by itself the moment the card
 *                  takes `.tone-dark`. No hover pair to keep in sync, the same
 *                  mechanism the card's own type already uses.
 *   --icon-accent — one shape per mark. Ash at rest, voltage when the card is
 *                  dark. Declared in globals.css next to the card's own tone
 *                  rules, including the CSS-only fallback branch.
 *
 * Voltage is the only accent these may take. AGENTS.md reserves mint for tags
 * and links, and there is no blue in the system at all — a third hue would be
 * a change to the design system, not to this file. So the six marks are told
 * apart by shape and by which part of the shape lights up, never by hue.
 *
 * Drawn on one 48-unit grid at one stroke weight, with corner radii echoing
 * the card's own. Flat fills and strokes only: the system has no elevation
 * scale and nothing here may invent one.
 */

const A = "var(--icon-accent)";
/* 2, not 3. At 3 the stroke ate the gaps: the product stack's bars sat 3px
   apart and each stroke spread 1.5px either way, so they met and the mark read
   as one hatched block rather than three things. Every clearance below is
   therefore quoted as the gap MINUS the stroke — that is the number the eye
   actually gets. */
const STROKE = {
  stroke: "currentColor",
  strokeWidth: 2,
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** A page being built: a frame, its chrome bar, one block laid into it. */
function WebDesign() {
  return (
    <>
      <rect x="5" y="9" width="38" height="30" rx="6" {...STROKE} />
      <path d="M5 18h38" {...STROKE} />
      <rect x="10" y="23" width="15" height="11" rx="3" fill={A} />
    </>
  );
}

/** The same page, replaced: the old outline still there, the new one over it. */
function Redesign() {
  return (
    <>
      <rect x="5.5" y="5.5" width="24" height="24" rx="6" {...STROKE} />
      <rect
        x="18.5"
        y="18.5"
        width="24"
        height="24"
        rx="6"
        {...STROKE}
        fill={A}
      />
    </>
  );
}

/** Something shipped in versions: a stack, newest on top.
 *
 *  The three bars taper. Drawn at equal widths they were a hamburger menu —
 *  three identical rounded rules is a navigation glyph before it is anything
 *  else, and no amount of context in the card title outranks that. Narrowing
 *  each one above the last makes it read as things piled up.
 *
 *  4.5px between bars, which at a 2px stroke leaves 2.5px of daylight. At the
 *  original 3px stroke and 3px pitch there was none, and the three bars
 *  touched. */
function DigitalProducts() {
  return (
    <>
      <rect x="5" y="33" width="38" height="9" rx="4" {...STROKE} />
      <rect x="10" y="19.5" width="28" height="9" rx="4" {...STROKE} />
      <rect x="15" y="6" width="18" height="9" rx="4" {...STROKE} fill={A} />
    </>
  );
}

/** A handset, screen lit. Not a wrapped page — see the card's own copy. */
function AndroidDevelopment() {
  return (
    <>
      <rect x="13" y="4" width="22" height="40" rx="6" {...STROKE} />
      <path d="M21 9h6" {...STROKE} />
      <rect x="17" y="14" width="14" height="21" rx="2" fill={A} />
    </>
  );
}

/** Three months of it, the last one still climbing. */
function CareGrowth() {
  return (
    <>
      <rect x="6" y="28" width="9" height="14" rx="2" fill="currentColor" />
      <rect x="19.5" y="20" width="9" height="22" rx="2" fill="currentColor" />
      <rect x="33" y="9" width="9" height="33" rx="2" fill={A} />
    </>
  );
}

/** Separate pieces wired into one thing. */
function DigitalSolutions() {
  return (
    <>
      <path d="M13 31 24 15l11 16" {...STROKE} />
      <circle cx="12" cy="35" r="6" fill="currentColor" />
      <circle cx="36" cy="35" r="6" fill="currentColor" />
      <circle cx="24" cy="12" r="6.5" fill={A} />
    </>
  );
}

const MARKS: Record<string, () => React.ReactElement> = {
  "website-design": WebDesign,
  redesign: Redesign,
  "digital-products": DigitalProducts,
  "android-development": AndroidDevelopment,
  "care-growth": CareGrowth,
  "digital-solutions": DigitalSolutions,
};

export function ServiceIcon({ slug }: { slug: string }) {
  const Mark = MARKS[slug];
  // A service with no mark drawn for it gets no placeholder. A generic glyph
  // on one card in a set of six is worse than an honest gap.
  if (!Mark) return null;

  return (
    /* Hidden until the card itself is wide enough, measured with a container
       query rather than a breakpoint: the card is 773px on a 27" monitor and
       334px in the two-column band around tablet width, and it is the CARD's
       width that decides whether a mark fits beside the type — the viewport's
       has nothing to do with it. Same reasoning as the `@container` on
       work-still.tsx.

       Two things about the numbers, both learned the hard way:

       They are px rather than rem because a font-relative unit inside a
       container query resolves against the query container, not the root, so
       `@[22rem]` was not 352px here.

       And they are measured against the card's CONTENT box, which is what a
       container query compares — not the border box a devtools ruler shows.
       The card carries 32px of padding a side, so the 416px card on a laptop
       is a 350px container and the 773px card on a 27" monitor is a 707px
       one. 340 is therefore just under the laptop's three-column card and
       comfortably over the ~330px it drops to in the two-column band around
       tablet width, which is exactly where the type stops having room to sit
       beside a mark. */
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className="service-icon hidden size-12 shrink-0 self-center @[340px]:block @[480px]:size-16"
    >
      <Mark />
    </svg>
  );
}
