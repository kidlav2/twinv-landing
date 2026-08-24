/**
 * The laptop's base: deck, speaker grilles, keyboard, trackpad, front lip.
 *
 * Purely presentational and `aria-hidden` — it is a drawing of an object, so
 * a screen reader has no business walking 70 key legends. Only the lid's
 * screen (in about-stage.tsx) holds real content.
 *
 * On the flat-design contract: AGENTS.md bans shadows and gradients on
 * *surfaces* — cards, buttons, panels — because depth there must come from
 * surface contrast. This is not a surface, it is imagery, and DESIGN.md's own
 * imagery direction is "photorealistic 3D renders of physical objects… the
 * material/tactile treatment contrasts with the flat typographic UI". So the
 * laptop is allowed to look like a laptop. It still earns its depth the
 * system's way: four flat tones (canvas → slate body → graphite keys →
 * carbon wells) and not one box-shadow or gradient fill.
 *
 * Every colour is a token. The only literal values are geometry.
 */

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
      className="bg-graphite flex h-[22px] items-center justify-center rounded-[3px]"
    >
      {k.l ? (
        <span className="text-smoke font-mono text-[6px] leading-none">
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
          "radial-gradient(circle, var(--color-carbon) 0.5px, transparent 0.5px)",
        backgroundSize: "3px 3px",
      }}
    />
  );
}

export function MacbookBody({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      data-chrome
      style={style}
      className="bg-slate absolute rounded-b-[16px] rounded-t-[4px] px-4 pt-2 pb-3"
    >
      {/* The strip the hinge sits behind, so the lid does not appear to grow
          straight out of the deck. */}
      <div className="bg-carbon mx-auto h-[10px] w-[74%] rounded-b-[3px]" />

      <div className="mt-2 flex items-stretch gap-2">
        <div className="w-[7%]">
          <SpeakerGrille />
        </div>

        {/* The keyboard well. Keys sit a shade lighter than the well they are
            recessed into — that contrast is the whole depth cue here. */}
        <div className="bg-carbon flex flex-1 flex-col gap-[2px] rounded-[4px] p-[3px]">
          {ROWS.map((row, i) => (
            <div key={i} className="flex gap-[2px]">
              {row.map((k, j) => (
                <Keycap key={j} k={k} />
              ))}
            </div>
          ))}

          <div className="flex gap-[2px]">
            {BOTTOM.map((k, j) => (
              <Keycap key={j} k={k} />
            ))}
            {/* Arrow cluster: a half-height up key over three half-height
                keys, the way the real one is laid out. */}
            <div
              style={{ flexGrow: 3, flexBasis: 0 }}
              className="flex flex-col gap-[2px]"
            >
              <div className="bg-graphite mx-auto h-[10px] w-1/3 rounded-[3px]" />
              <div className="flex gap-[2px]">
                <div className="bg-graphite h-[10px] flex-1 rounded-[3px]" />
                <div className="bg-graphite h-[10px] flex-1 rounded-[3px]" />
                <div className="bg-graphite h-[10px] flex-1 rounded-[3px]" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-[7%]">
          <SpeakerGrille />
        </div>
      </div>

      {/* Trackpad. Lighter than the body rather than outlined — a hairline
          border on a dark object would read as a UI element, not a surface. */}
      <div className="bg-graphite mx-auto mt-3 h-[86px] w-[38%] rounded-[8px]" />
    </div>
  );
}

/** The notch in the front edge you lift the lid by. */
export function MacbookLip({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      data-chrome
      style={style}
      className="bg-graphite absolute h-[5px] rounded-b-[6px]"
    />
  );
}
