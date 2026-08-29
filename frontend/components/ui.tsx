import Link from "next/link";
import type { ReactNode } from "react";

/* Component specs come straight from the design system:
   filled 8px radius · ghost 1.5px at 4px · mint tag 64px.

   The two main buttons take their fill from `.btn-primary` / `.btn-ghost` in
   globals.css rather than colour utilities, so they invert automatically inside
   a `.tone-dark` zone.

   A cursor-tracking sweep-fill was tried here and pulled back out — it read as
   fussy on a plain filled button. Plain CSS hover, nothing clever.

   The nudging `→` that used to sit inside ButtonPrimary is gone for the same
   reason: a filled button already reads as the action, and the arrow was
   decoration on top of an affordance that did not need help. */

export function ButtonPrimary({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`btn-primary rounded-btn inline-flex items-center justify-center px-6 py-4 text-body font-medium transition-colors duration-200 ${className}`}
    >
      {children}
    </Link>
  );
}

export function ButtonGhost({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`btn-ghost rounded-btn-sharp inline-flex items-center justify-center border-[1.5px] px-6 py-4 text-body font-medium transition-colors duration-200 ${className}`}
    >
      {children}
    </Link>
  );
}

/** Mint is reserved for tags and links — never for large surfaces. */
export function Tag({
  children,
  className = "",
  muted = false,
  onClick,
  selected,
  id,
  tabIndex,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  onClick?: () => void;
  selected?: boolean;
  id?: string;
  tabIndex?: number;
}) {
  const tone = muted
    ? "bg-ash text-carbon hover:bg-slate"
    : "bg-mint text-carbon";
  const shape = `rounded-tag font-mono inline-flex items-center px-4 py-2 text-caption uppercase ${tone} ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        id={id}
        role="tab"
        aria-selected={selected}
        tabIndex={tabIndex}
        onClick={onClick}
        className={`cursor-pointer ${shape}`}
      >
        {children}
      </button>
    );
  }

  return <span className={shape}>{children}</span>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-faint font-mono text-caption uppercase">{children}</p>
  );
}

export function TextLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  /** Opens in a new tab. The arrow becomes ↗ so the destination is not
   *  mistaken for another page on this site. */
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="text-fg decoration-line hover:decoration-current inline-flex min-h-11 items-center gap-2 text-body-sm font-medium underline underline-offset-4 transition-colors"
    >
      {children}
      <span aria-hidden>{external ? "↗" : "→"}</span>
    </Link>
  );
}
