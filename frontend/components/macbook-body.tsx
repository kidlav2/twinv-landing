/**
 * The laptop's base: deck, speaker grilles, keyboard, trackpad, and the
 * finger recess in the front edge.
 *
 * Purely presentational and `aria-hidden` — it is a drawing of an object, so
 * a screen reader has no business walking 79 key legends. Only the lid's
 * screen (in about-stage.tsx) holds real content.
 *
 * On the flat-design contract: AGENTS.md bans shadows and gradients on
 * *surfaces* — cards, buttons, panels — because depth there must come from
 * surface contrast. This is not a surface, it is imagery, and DESIGN.md's own
 * imagery direction is "photorealistic 3D renders of physical objects… the
 * material/tactile treatment contrasts with the flat typographic UI". So the
 * laptop is allowed to look like a laptop — including a lit keyboard, which
 * is on direct request after an earlier pass had pulled the backlight out.
 * It is kept to the KEYS: light inside the tray's own well, legends printed
 * in it, and nothing spilling onto the aluminium or past the machine. A
 * backlight seen through the keys is the object's own detail; a machine with
 * a halo around it would be the elevation the system does not have.
 *
 * The modelling below (see `EDGE`) is the same distinction drawn one level
 * down: every shadow here is INSET. An outer shadow is elevation — an object
 * floating above the page — and that is the thing the system does not have.
 * An inset highlight or shade is the object's own form: which way a bevel
 * faces, how deep a well is cut. Nothing here casts onto the canvas.
 *
 * Everything is drawn at a fixed design size and scaled by `--machine-k`
 * (set in globals.css against viewport height, since a full-size machine
 * does not fit a 768px-tall laptop screen). Scaling the whole deck is what
 * keeps ~40px keycaps from having to be re-proportioned per viewport.
 */

/** Design-space dimensions. about-stage.tsx imports these — one source. */
export const LID_W = 760;
export const LID_H = 475; // 16:10, the real panel aspect
/**
 * The aluminium the panel is set into. The lid used to be a bare black
 * rectangle, which is why it read as a dark card rather than as a screen —
 * a display is only legible as one when something frames it. The frame is the
 * same `slate` as the deck, so the machine is one material seen twice.
 */
export const BEZEL = 15;
export const SCREEN_W = LID_W - BEZEL * 2;
export const SCREEN_H = LID_H - BEZEL * 2;
/**
 * Deck depth. Deliberately ~0.6 of the width rather than the 0.55 it was: a
 * shallower deck than the real machine is the thing that makes a drawn laptop
 * look like a drawing, and the extra depth is what gives the trackpad and the
 * palm rest below the keyboard room to be proportioned.
 */
export const BASE_H = 460;
export const TOTAL_H = LID_H + BASE_H;

/** Outer/inner corner radii of the lid, in the same design space. */
export const LID_R = 20;
export const SCREEN_R = 10;

/**
 * Design px → rendered px.
 *
 * `--machine-k` is set in globals.css (see the note at the top of this file)
 * and read back here rather than passed in, so a caller cannot place a part of
 * the machine at a scale the rest of it is not using.
 *
 * Anything GSAP rotates has to be sized this way instead of being drawn at
 * design size under a CSS `scale()`, since GSAP owns the whole `transform`
 * property on those elements — the conflict AGENTS.md warns about.
 */
export const kpx = (px: number) => `calc(${px}px * var(--machine-k))`;

/**
 * Edge modelling. All inset — see the note at the top of this file.
 *
 * One light direction for the whole machine: from above. So every upward-
 * facing edge carries the highlight and every downward-facing one the shade,
 * and a well is simply the two swapped. Getting that consistent is most of
 * what separates "drawn in 3D" from "rectangles with borders".
 */
const EDGE = {
  /** A milled aluminium face. */
  metal:
    "inset 0 1px 0 rgba(255,255,255,0.17), inset 0 -1px 0 rgba(0,0,0,0.45)",
  /** Something cut INTO the metal: keyboard tray, trackpad, screen recess. */
  well: "inset 0 2px 5px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(0,0,0,0.55)",
  /**
   * One keycap — bevelled top, its own bottom edge in shade, and the
   * backlight leaking around the cap from the tray beneath it.
   *
   * The leak is an INSET ring, not an outer glow, for the reason at the top
   * of this file: light escaping past the edges of a cap is the cap being lit
   * from under; a blurred halo outside the box would be the machine floating.
   */
  key: "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -2px 2px rgba(0,0,0,0.5), inset 0 0 5px rgba(233,242,255,0.14)",
} as const;

/**
 * The lamp under the keys. A wide, soft pool centred on the tray so the
 * middle rows are brightest and the light falls off before the aluminium —
 * the machine reads as lit from inside its own well rather than as a glowing
 * rectangle.
 *
 * Very slightly cool (#e9f2ff at a few percent), which is what the real
 * backlight is; a neutral white pool on a neutral grey deck disappears into
 * the metal instead of reading as light.
 */
const BACKLIGHT =
  "radial-gradient(120% 90% at 50% 45%, rgba(233,242,255,0.16) 0%, rgba(233,242,255,0.06) 45%, transparent 78%)";

/**
 * Anodised aluminium, lit from above. Shallow on purpose: a strong gradient
 * turns the deck into a plastic slab, and all that is wanted here is enough
 * fall-off that the front edge is not the same value as the palm rest.
 */
const ALUMINIUM =
  "linear-gradient(180deg, #4f4f4f 0%, #454545 52%, #363636 100%)";

type Key = { l?: string; w?: number };

const ROWS: Key[][] = [
  [
    { l: "esc", w: 1.7 },
    { l: "F1" },
    { l: "F2" },
    { l: "F3" },
    { l: "F4" },
    { l: "F5" },
    { l: "F6" },
    { l: "F7" },
    { l: "F8" },
    { l: "F9" },
    { l: "F10" },
    { l: "F11" },
    { l: "F12" },
    {},
  ],
  [
    { l: "~" },
    { l: "1" },
    { l: "2" },
    { l: "3" },
    { l: "4" },
    { l: "5" },
    { l: "6" },
    { l: "7" },
    { l: "8" },
    { l: "9" },
    { l: "0" },
    { l: "-" },
    { l: "=" },
    { l: "delete", w: 1.7 },
  ],
  [
    { l: "tab", w: 1.7 },
    { l: "Q" },
    { l: "W" },
    { l: "E" },
    { l: "R" },
    { l: "T" },
    { l: "Y" },
    { l: "U" },
    { l: "I" },
    { l: "O" },
    { l: "P" },
    { l: "[" },
    { l: "]" },
    { l: "\\", w: 1.3 },
  ],
  [
    { l: "caps", w: 2 },
    { l: "A" },
    { l: "S" },
    { l: "D" },
    { l: "F" },
    { l: "G" },
    { l: "H" },
    { l: "J" },
    { l: "K" },
    { l: "L" },
    { l: ";" },
    { l: "'" },
    { l: "return", w: 2.3 },
  ],
  [
    { l: "shift", w: 2.7 },
    { l: "Z" },
    { l: "X" },
    { l: "C" },
    { l: "V" },
    { l: "B" },
    { l: "N" },
    { l: "M" },
    { l: "," },
    { l: "." },
    { l: "/" },
    { l: "shift", w: 2.7 },
  ],
];

const BOTTOM: Key[] = [
  { l: "fn" },
  { l: "ctrl" },
  { l: "opt" },
  { l: "cmd", w: 1.4 },
  { w: 6.2 },
  { l: "cmd", w: 1.4 },
  { l: "opt" },
];

function Keycap({ k }: { k: Key }) {
  return (
    <div
      style={{ flexGrow: k.w ?? 1, flexBasis: 0, boxShadow: EDGE.key }}
      className="bg-graphite flex h-9 items-center justify-center rounded-[5px]"
    >
      {k.l ? (
        <span className="kbd-legend font-mono text-[11px] leading-none">
          {k.l}
        </span>
      ) : null}
    </div>
  );
}

/** Perforation, drawn as a dot field rather than an image. */
function SpeakerGrille() {
  return (
    <div
      className="h-full w-full"
      style={{
        backgroundImage:
          "radial-gradient(circle, var(--color-carbon) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    />
  );
}

/**
 * The lid's aluminium shell — the frame the panel is set into.
 *
 * It is a SIBLING of the screen, not its parent, because the screen detaches
 * from it and grows into the whole viewport, and a wrapper would clip it.
 * Keeping them apart means about-stage.tsx has to place both against the same
 * hinge line; see the transform-origin note there.
 *
 * The empty well inside is not decoration. The display leaves the machine on
 * scroll, and what it leaves behind has to be a dark recess cut into the
 * aluminium — otherwise the lid reads as a solid slab with a hole punched in
 * it. At rest the display sits exactly on top of this and it is invisible.
 */
export function MacbookLid({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      data-lid
      style={{
        width: kpx(LID_W),
        height: kpx(LID_H),
        borderRadius: kpx(LID_R),
        backgroundImage: ALUMINIUM,
        boxShadow: EDGE.metal,
        ...style,
      }}
      className="bg-slate absolute"
    >
      <div
        style={{
          inset: kpx(BEZEL),
          borderRadius: kpx(SCREEN_R),
          boxShadow: EDGE.well,
        }}
        className="bg-carbon absolute"
      />

      {/* Camera. The one detail in the bezel, and the only reason the top
          band reads as the top of a screen rather than as an even border. */}
      <div
        aria-hidden
        style={{
          top: kpx(BEZEL / 2 - 2.5),
          width: kpx(5),
          height: kpx(5),
        }}
        className="bg-carbon absolute left-1/2 -translate-x-1/2 rounded-full"
      />
    </div>
  );
}

export function MacbookBody({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        width: LID_W,
        height: BASE_H,
        backgroundImage: ALUMINIUM,
        boxShadow: EDGE.metal,
        ...style,
      }}
      className="bg-slate absolute overflow-hidden rounded-t-[6px] rounded-b-[22px] px-7 pt-3 pb-8"
    >
      {/* The strip the hinge sits behind, so the lid does not appear to grow
          straight out of the deck. Graded dark-to-light downward — it is the
          one place on the machine lit from BELOW, because it is a cylinder
          sitting in a trough and its underside catches the deck. */}
      <div
        className="mx-auto h-3 w-[72%] rounded-b-[4px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #000 0%, #0b0b0b 58%, #2c2c2c 100%)",
        }}
      />

      <div className="mt-3 flex items-stretch gap-3">
        <div className="w-[6%]">
          <SpeakerGrille />
        </div>

        {/* The keyboard tray, cut into the deck: keys a shade lighter than the
            well they are recessed into, and the well's own top edge in shade
            so the cut has a depth rather than just a colour. The backlight
            pool is painted on the tray itself, so what shows between the caps
            is lit and the caps sit in front of it. */}
        <div
          className="bg-carbon flex flex-1 flex-col gap-[3px] rounded-[6px] p-1"
          style={{ backgroundImage: BACKLIGHT, boxShadow: EDGE.well }}
        >
          {ROWS.map((row, i) => (
            <div key={i} className="flex gap-[3px]">
              {row.map((k, j) => (
                <Keycap key={j} k={k} />
              ))}
            </div>
          ))}

          <div className="flex gap-[3px]">
            {BOTTOM.map((k, j) => (
              <Keycap key={j} k={k} />
            ))}
            {/* Arrow cluster: a half-height up key over three half-height
                keys, the way the real one is laid out. */}
            <div
              style={{ flexGrow: 3, flexBasis: 0 }}
              className="flex flex-col gap-[3px]"
            >
              <div
                className="bg-graphite mx-auto h-[16.5px] w-1/3 rounded-[5px]"
                style={{ boxShadow: EDGE.key }}
              />
              <div className="flex gap-[3px]">
                <div
                  className="bg-graphite h-[16.5px] flex-1 rounded-[5px]"
                  style={{ boxShadow: EDGE.key }}
                />
                <div
                  className="bg-graphite h-[16.5px] flex-1 rounded-[5px]"
                  style={{ boxShadow: EDGE.key }}
                />
                <div
                  className="bg-graphite h-[16.5px] flex-1 rounded-[5px]"
                  style={{ boxShadow: EDGE.key }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-[6%]">
          <SpeakerGrille />
        </div>
      </div>

      {/* Trackpad, and the studio mark as a die-cut on the left palm rest.

          Left of the pad, not on it: a mark on the glass would read as a UI
          watermark, and a mark on the right would sit where a right-handed
          palm actually lands. Slight rotation is what makes it a sticker
          rather than a caption. `text-paper` because the deck is dark metal
          and a carbon mark on carbon disappears; the same `.brand-mark` mask
          as the nav, so this cannot drift from the real wordmark. */}
      <div className="relative mt-5">
        <span className="brand-mark text-paper pointer-events-none absolute top-1/2 left-[4%] h-16 -translate-y-1/2 -rotate-[9deg]" />
        <div
          className="bg-graphite mx-auto h-[130px] w-[40%] rounded-[10px]"
          style={{
            boxShadow:
              "inset 0 1px 3px rgba(0,0,0,0.55), inset 0 -1px 0 rgba(255,255,255,0.07)",
          }}
        />
      </div>

      {/* The finger recess you lift the lid by. It is a notch cut INTO the
          front edge, so it is drawn inside the body and clipped by its own
          rounded corner — it is not a tab hanging off the bottom. */}
      <div className="bg-carbon absolute bottom-0 left-1/2 h-2 w-[17%] -translate-x-1/2 rounded-t-[8px]" />
    </div>
  );
}
