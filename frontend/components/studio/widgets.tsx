import type { ReactNode } from "react";
import {
  ACCOUNT_WARNING,
  CROSS_BORDER_WARNING,
  DISCLAIMER,
  TAX_DISCLAIMER,
} from "@/lib/studio/constants";

export function EstimateBanner() {
  return (
    <p
      role="note"
      className="studio-card text-muted px-4 py-3 text-body-sm"
    >
      {DISCLAIMER}
    </p>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <p
      role="note"
      className="border-line-strong rounded-btn border px-4 py-3 text-body-sm text-muted"
    >
      <span className="bg-voltage text-carbon font-mono mr-2 inline-block px-1.5 py-0.5 text-caption uppercase">
        Note
      </span>
      {children}
    </p>
  );
}

export function AccountWarning() {
  return <Warning>{ACCOUNT_WARNING}</Warning>;
}

export function CrossBorderWarning() {
  return <Warning>{CROSS_BORDER_WARNING}</Warning>;
}

export function TaxNote() {
  return (
    <p className="text-faint text-caption">{TAX_DISCLAIMER}</p>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="studio-card p-5">
      <p className="studio-label mb-2">{label}</p>
      <p className="font-display text-heading-sm text-fg">{value}</p>
      {hint ? <p className="text-faint mt-2 text-caption">{hint}</p> : null}
    </div>
  );
}

export function StatusPill({
  status,
}: {
  status: "unpaid" | "partial" | "paid" | "pending" | "received" | string;
}) {
  const label =
    status === "unpaid"
      ? "Unpaid"
      : status === "partial"
        ? "Partially paid"
        : status === "paid"
          ? "Paid"
          : status === "pending"
            ? "Pending"
            : status === "received"
              ? "Received"
              : status;
  const tone =
    status === "paid" || status === "received"
      ? "bg-mint text-carbon"
      : status === "partial"
        ? "border-line-strong border text-fg"
        : "border-line border text-muted";
  return (
    <span
      className={`${tone} font-mono inline-flex items-center rounded-tag px-3 py-1 text-caption uppercase`}
    >
      {label}
    </span>
  );
}

export function PageTitle({
  kicker,
  children,
  aside,
}: {
  kicker: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="studio-label">{kicker}</p>
        <h1 className="font-display text-heading-lg mt-1">{children}</h1>
      </div>
      {aside}
    </header>
  );
}
