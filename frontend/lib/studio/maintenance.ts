import type { Maintenance } from "./types";

export type MaintenanceAlert = {
  level: "30" | "14" | "7" | "overdue";
  days: number;
  until: string;
};

function addMonths(iso: string, months: number): Date {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

export function includedUntil(m: Maintenance): Date {
  return addMonths(m.startDate, m.includedMonths);
}

export function daysUntil(date: Date, now = new Date()): number {
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((b - a) / 86_400_000);
}

export function maintenanceAlert(
  m: Maintenance,
  now = new Date(),
): MaintenanceAlert | null {
  if (!m.active) return null;
  const until = includedUntil(m);
  const days = daysUntil(until, now);
  const iso = until.toISOString().slice(0, 10);
  if (days < 0) return { level: "overdue", days, until: iso };
  if (days <= 7) return { level: "7", days, until: iso };
  if (days <= 14) return { level: "14", days, until: iso };
  if (days <= 30) return { level: "30", days, until: iso };
  return null;
}

export function alertCopy(alert: MaintenanceAlert): string {
  if (alert.level === "overdue") {
    return `Included maintenance ended ${Math.abs(alert.days)} day(s) ago (${alert.until}).`;
  }
  return `Maintenance renewal approaching — ${alert.days} day(s) (${alert.until}).`;
}
