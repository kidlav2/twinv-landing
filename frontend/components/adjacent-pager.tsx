import Link from "next/link";

/**
 * Prev / next as one row at every width. Stacking them on a phone (`grid`
 * with a `sm:` breakpoint) made two full-width tiles and a long scroll
 * between the page and the footer — the same pager on work and services.
 */
export function AdjacentPager({
  label,
  prev,
  next,
}: {
  label: string;
  prev: { href: string; kicker: string; title: string };
  next: { href: string; kicker: string; title: string };
}) {
  return (
    <nav aria-label={label} className="border-line border-t">
      <div className="grid grid-cols-2">
        <Link
          href={prev.href}
          className="pager-tile group border-line flex min-w-0 flex-col gap-2 border-r p-5 transition-colors duration-300 sm:gap-3 sm:p-8 lg:p-12"
        >
          <span className="pager-label text-faint font-mono text-caption uppercase transition-colors duration-300">
            ← {prev.kicker}
          </span>
          <span className="pager-title font-display text-fg line-clamp-2 text-heading-sm transition-colors duration-300 lg:text-heading">
            {prev.title}
          </span>
        </Link>
        <Link
          href={next.href}
          className="pager-tile group flex min-w-0 flex-col items-end gap-2 p-5 text-right transition-colors duration-300 sm:gap-3 sm:p-8 lg:p-12"
        >
          <span className="pager-label text-faint font-mono text-caption uppercase transition-colors duration-300">
            {next.kicker} →
          </span>
          <span className="pager-title font-display text-fg line-clamp-2 text-heading-sm transition-colors duration-300 lg:text-heading">
            {next.title}
          </span>
        </Link>
      </div>
    </nav>
  );
}
