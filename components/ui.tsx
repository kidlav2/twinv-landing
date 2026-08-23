import Link from "next/link";
import type { ReactNode } from "react";

/* Component specs come straight from the design system:
   filled 8px radius · ghost 1.5px at 4px · mint tag 64px.

   The two main buttons take their fill from `.btn-primary` / `.btn-ghost` in
   globals.css rather than colour utilities, so they invert automatically inside
   a `.tone-dark` zone.

   A cursor-tracking sweep-fill was tried here and pulled back out — it read as
   fussy on a plain filled button. Plain CSS hover, nothing clever. */

export function ButtonPrimary({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
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
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-mint text-carbon rounded-tag font-mono inline-flex items-center px-4 py-2 text-caption uppercase ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-faint font-mono text-caption uppercase">{children}</p>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-fg decoration-line hover:decoration-current inline-flex items-center gap-2 text-body-sm font-medium underline underline-offset-4 transition-colors"
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  );
}
