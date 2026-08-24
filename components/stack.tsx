import { stack } from "@/lib/content";
import { Reveal } from "./reveal";
import { StackAccent } from "./stack-accent";

/**
 * Tone-aware (text-muted/border-line), so it needs no surface of its own
 * regardless of which zone it lives in.
 *
 * Chips, not a plain word list: flat text against the generous shell padding
 * on a wide screen read as mostly empty space with a few words floating in
 * it. A bordered pill per item gives the row actual visual weight and a
 * hover response, without introducing a card/shadow the system doesn't have.
 */
export function Stack() {
  return (
    <section id="stack" className="relative py-section-lg">
      <StackAccent />
      <StackAccent side="left" />
      <Reveal className="shell">
        {/* z-10 on the copy, not on the accents: the accents are tucked into
            the gutters, but the heading column is centred and its width
            follows the copy. If that copy ever grows, the text must draw over
            the decoration rather than under it. */}
        <div className="relative z-10 mx-auto max-w-[46ch] text-center">
          <h2 className="reveal font-display text-heading-lg">
            {stack.headline}
          </h2>
          <p className="reveal text-muted mt-6 text-sub">{stack.sub}</p>
        </div>

        <div className="mt-12 flex flex-col gap-8 sm:mt-20 sm:gap-12">
          {stack.groups.map((group) => (
            <div
              key={group.title}
              className="reveal relative z-10 flex flex-col items-center gap-5"
            >
              {/* Was text-caption (12px) — bumped so the group label reads as
                  a heading of its own, not a fine-print tag. */}
              <p className="text-faint font-mono text-body-sm uppercase">
                {group.title}
              </p>
              <ul className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {group.items.map((item) => (
                  <li key={item}>
                    {/* Bigger and heavier than the sub-copy above (text-sub,
                        18px) on purpose — was mono/text-body-sm (14px), which
                        made the actual stack read smaller than its own
                        description. font-display carries the weight; no
                        separate font-bold needed.

                        Measured at 375px before the sm: step-up existed: 28px
                        type with 28px/12px padding put a chip like
                        "PostgreSQL" at 122px wide, wrapped the 7-item
                        Interface row across 4 lines, and ran the section to
                        1218px — the "huge gaps between short words" look.
                        text-sub (18px) with tighter padding is still plainly
                        heavier than the sub-copy above it, just not louder
                        than the screen it's on. */}
                    <span className="border-line hover:bg-fg hover:text-canvas hover:border-fg rounded-tag font-display inline-flex items-center px-4 py-2 text-sub transition-colors duration-200 sm:px-7 sm:py-3 sm:text-heading-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
