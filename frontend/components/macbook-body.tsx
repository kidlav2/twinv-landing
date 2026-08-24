/**
 * The laptop's base: deck, speaker grilles, backlit keyboard, trackpad, and
 * the finger recess in the front edge.
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
 * laptop is allowed to look like a laptop, and the keyboard is allowed to be
 * lit — that glow is light coming out of a depicted object, not elevation
 * faked on a control.
 *
 * Everything is drawn at a fixed design size and scaled by `--machine-k`
 * (set in globals.css against viewport height, since a full-size machine
 * does not fit a 768px-tall laptop screen). Scaling the whole deck is what
 * keeps ~40px keycaps from having to be re-proportioned per viewport.
 */

/** Design-space dimensions. about-stage.tsx imports these — one source. */
export const LID_W = 760;
export const LID_H = 475; // 16:10, the real panel aspect
export const BASE_H = 420;
export const TOTAL_H = LID_H + BASE_H;

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
      style={{ flexGrow: k.w ?? 1, flexBasis: 0 }}
      className="kbd-key bg-graphite flex h-9 items-center justify-center rounded-[5px]"
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

export function MacbookBody({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      data-chrome
      style={{ width: LID_W, height: BASE_H, ...style }}
      className="bg-slate absolute overflow-hidden rounded-t-[6px] rounded-b-[22px] px-7 pt-3 pb-5"
    >
      {/* The strip the hinge sits behind, so the lid does not appear to grow
          straight out of the deck. */}
      <div className="bg-carbon mx-auto h-3 w-[72%] rounded-b-[4px]" />

      <div className="mt-3 flex items-stretch gap-3">
        <div className="w-[6%]">
          <SpeakerGrille />
        </div>

        {/* The keyboard well. Keys sit a shade lighter than the well they are
            recessed into — that contrast is the structural depth cue; the
            backlight on top of it is the object's own light. */}
        <div className="bg-carbon flex flex-1 flex-col gap-[3px] rounded-[6px] p-1">
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
              <div className="kbd-key bg-graphite mx-auto h-[16.5px] w-1/3 rounded-[5px]" />
              <div className="flex gap-[3px]">
                <div className="kbd-key bg-graphite h-[16.5px] flex-1 rounded-[5px]" />
                <div className="kbd-key bg-graphite h-[16.5px] flex-1 rounded-[5px]" />
                <div className="kbd-key bg-graphite h-[16.5px] flex-1 rounded-[5px]" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-[6%]">
          <SpeakerGrille />
        </div>
      </div>

      {/* Trackpad. Lighter than the body rather than outlined — a hairline
          border on a dark object would read as a UI element, not a surface. */}
      <div className="bg-graphite mx-auto mt-4 h-[104px] w-[38%] rounded-[10px]" />

      {/* The finger recess you lift the lid by. It is a notch cut INTO the
          front edge, so it is drawn inside the body and clipped by its own
          rounded corner — it is not a tab hanging off the bottom. */}
      <div className="bg-carbon absolute bottom-0 left-1/2 h-2 w-[17%] -translate-x-1/2 rounded-t-[8px]" />
    </div>
  );
}
