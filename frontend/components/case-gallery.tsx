import { Reveal } from "./reveal";
import { WorkStill } from "./work-still";

/**
 * Screenshots after the case timeline, sized to one monitor. Phone keeps
 * a stacked 3:2 strip; desktop locks the block to the viewport so the
 * frames sit under the nav instead of running taller than the screen.
 *
 * The first slot is always the hero shot; anything in `gallery` follows.
 * An odd remainder still uses the same wide-first arithmetic as `/work`.
 */
export function CaseGallery({
  slug,
  shots,
  heading,
}: {
  slug: string;
  shots: string[];
  heading: string;
}) {
  if (!shots.length) return null;

  const wideFirst = shots.length % 2 === 1;

  return (
    <section className="max-lg:pb-section lg:h-svh">
      <Reveal className="shell flex h-full flex-col lg:pt-[calc(var(--nav-height)+12px)] lg:pb-8">
        <h2 className="reveal font-display max-w-[12ch] shrink-0 text-heading-lg">
          {heading}
        </h2>
        <div className="mt-8 grid min-h-0 flex-1 gap-4 lg:h-0 lg:grid-cols-2 lg:gap-4">
          {shots.map((src, i) => {
            const feature = wideFirst && i === 0;
            return (
              <WorkStill
                key={`${src}-${i}`}
                slug={slug}
                image={src}
                size="fit"
                bleed={false}
                className={`reveal ${feature ? "lg:col-span-2" : ""}`}
              />
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
