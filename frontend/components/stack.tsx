import { stack } from "@/lib/content";
import { Reveal } from "./reveal";
import { StackAccent } from "./stack-accent";

/**
 * Tone-aware (text-muted/border-line), so it needs no surface of its own
 * regardless of which zone it lives in.
 *
 * Two rows, not a 3-col grid: three groups on top, two below, each row
 * `justify-between` so the last pair is not stuck under columns 1 and 2.
 * Copy is centred inside its cell — the left-aligned chips were reading as
 * a ragged column against the centred heading.
 */
function Group({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="reveal flex min-w-0 flex-1 flex-col items-center text-center">
      <p className="text-faint w-full font-mono text-caption uppercase">{title}</p>
      <ul className="mt-4 flex w-full flex-wrap justify-center gap-2 sm:mt-5 sm:gap-3">
        {items.map((item) => (
          <li key={item}>
            <span className="border-line hover:bg-fg hover:text-canvas hover:border-fg rounded-tag font-display inline-flex cursor-default items-center whitespace-nowrap px-3 py-1.5 text-heading-sm leading-none transition-colors duration-200 sm:px-4 sm:py-2">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stack() {
  const [top, bottom] = [stack.groups.slice(0, 3), stack.groups.slice(3)];

  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="relative isolate flex flex-col justify-center overflow-hidden py-section lg:min-h-[calc(100dvh-var(--nav-height))] lg:py-10"
    >
      <StackAccent />
      <StackAccent side="left" />
      <Reveal className="shell">
        <div className="relative z-10 mx-auto max-w-[46ch] text-center">
          <h2 id="stack-heading" className="reveal font-display text-heading-lg">
            {stack.headline}
          </h2>
          <p className="reveal text-muted mt-4 text-pretty text-sub sm:mt-6">
            {stack.sub}
          </p>
        </div>

        <div className="relative z-10 mt-10 flex flex-col gap-14 sm:mt-14 sm:gap-16 lg:mt-16 lg:gap-24">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-8">
            {top.map((group) => (
              <Group key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-8">
            {bottom.map((group) => (
              <Group
                key={group.title}
                title={group.title}
                items={group.items}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
