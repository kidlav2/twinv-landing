import Link from "next/link";
import { footer, nav } from "@/lib/content";
import { ButtonPrimary } from "./ui";

/**
 * Mobile is a 2-column link grid under the brand, not a centred stub that
 * hides Services and Studio. Those columns were dropped below `lg` to save
 * height; what it actually did was leave a brand block and four social
 * links stacked in the middle of the screen, which read as unfinished.
 * Two columns fit a 375px width; the brand spans both so the mark stays
 * on the leading edge (Krehel: order by importance, align to shared edges).
 * Connect spans the row as a wrapping list — four socials side-by-side
 * rather than a third ragged column.
 *
 * Colours are tone-aware ROLES (text-fg / text-muted / text-faint /
 * border-line), not fixed palette names, so this renders correctly inside a
 * `.tone-dark` zone. The voltage email chip stays fixed: yellow-on-black
 * reads in both tones.
 *
 * `flush` drops the top padding so a full-bleed block immediately above
 * sits directly against the footer's first rule.
 *
 * `cta` exists for one situation: a page whose own closing panel is already a
 * "start a project" button, a screen-height above this one. Two identical
 * yellow pills that far apart do not read as emphasis, they read as the site
 * repeating itself — so /work turns this one off. Default on, because every
 * other route ends on something that is not a CTA and needs it.
 */
export function Footer({
  flush = false,
  cta = true,
}: {
  flush?: boolean;
  cta?: boolean;
}) {
  return (
    <footer className={`${flush ? "" : "pt-section"} pb-[max(2rem,env(safe-area-inset-bottom))] sm:pb-[max(2.5rem,env(safe-area-inset-bottom))]`}>
      {/* Full-bleed rules. The border lives on its own element OUTSIDE
          `.shell`, so it runs edge to edge while the content below keeps the
          gutter. */}
      <div className="border-line border-t" />

      <div className="shell pt-8 lg:pt-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-x-8 lg:gap-y-12">
          <div className="col-span-2 lg:col-span-1">
            <span
              className="brand-mark text-fg h-10 sm:h-12"
              role="img"
              aria-label={nav.brand}
            />
            <p className="text-muted mt-4 max-w-[32ch] text-pretty text-body-sm leading-[1.45] sm:mt-5">
              {footer.blurb}
            </p>
            <a
              href={`mailto:${footer.email}`}
              className="bg-voltage text-carbon rounded-btn-sharp mt-5 inline-block max-w-full px-2 py-1 break-words text-body font-medium sm:mt-6"
            >
              {footer.email}
            </a>
            {cta ? (
              <div className="mt-5 sm:mt-6">
                <ButtonPrimary href={footer.cta.href}>
                  {footer.cta.label}
                </ButtonPrimary>
              </div>
            ) : null}
          </div>

          {footer.columns.map((col) => {
            const connect = col.title === "Connect";
            return (
              <div
                key={col.title}
                className={connect ? "col-span-2 lg:col-span-1" : undefined}
              >
                <p className="text-faint font-mono text-caption uppercase">
                  {col.title}
                </p>
                <ul
                  className={
                    connect
                      ? "mt-4 flex flex-wrap gap-x-6 gap-y-0 sm:mt-5 lg:flex-col lg:gap-x-0 lg:gap-y-1"
                      : "mt-4 flex flex-col gap-1 sm:mt-5"
                  }
                >
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-muted hover:text-fg inline-flex min-h-11 items-center text-body-sm transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-line mt-10 border-t lg:mt-16" />

      <div className="shell pt-6">
        <div className="text-faint flex flex-col gap-4 text-caption sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {nav.brand}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6">
            {footer.legal.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="hover:text-fg inline-flex min-h-11 items-center transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
