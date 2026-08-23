import { stack } from "@/lib/content";
import { Reveal } from "./reveal";

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
    <section id="stack" className="py-32">
      <Reveal className="shell">
        <div className="mx-auto max-w-[46ch] text-center">
          <h2 className="reveal font-display text-heading-lg">
            {stack.headline}
          </h2>
          <p className="reveal text-muted mt-6 text-sub">{stack.sub}</p>
        </div>

        <div className="mt-20 flex flex-col gap-12">
          {stack.groups.map((group) => (
            <div
              key={group.title}
              className="reveal flex flex-col items-center gap-5"
            >
              <p className="text-faint font-mono text-caption uppercase">
                {group.title}
              </p>
              <ul className="flex flex-wrap justify-center gap-3">
                {group.items.map((item) => (
                  <li key={item}>
                    <span className="border-line hover:bg-fg hover:text-canvas hover:border-fg rounded-tag font-mono inline-flex items-center px-5 py-2.5 text-body-sm uppercase transition-colors duration-200">
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
