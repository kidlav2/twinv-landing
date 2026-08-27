"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { StudioProvider, useStudio } from "@/lib/studio/store";
import { EstimateBanner } from "./widgets";

const LINKS = [
  { href: "/studio", label: "Overview" },
  { href: "/studio/projects", label: "Projects" },
  { href: "/studio/founders/a", label: "a" },
  { href: "/studio/founders/b", label: "b" },
  { href: "/studio/pricing", label: "Pricing" },
  { href: "/studio/accounts", label: "Accounts" },
  { href: "/studio/settings", label: "Settings" },
] as const;

export function StudioShell({ children }: { children: ReactNode }) {
  return (
    <StudioProvider>
      <ShellFrame>{children}</ShellFrame>
    </StudioProvider>
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const { state, ready, patchSettings } = useStudio();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dark = state.settings.theme === "dark";

  const isCurrent = (href: string) => {
    if (href === "/studio") return pathname === "/studio";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className={`studio-app ${dark ? "tone-dark" : "tone-light"}`}>
      <a
        href="#studio-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        <header className="border-line flex items-center justify-between border-b px-5 py-4 lg:hidden">
          <Link href="/studio" className="font-display text-heading-sm">
            Twin V
          </Link>
          <button
            type="button"
            className="border-line-strong rounded-btn min-h-11 cursor-pointer border px-4 text-body-sm"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </header>

        <aside
          className={`${open ? "block" : "hidden"} border-line lg:sticky lg:top-0 lg:block lg:h-dvh lg:border-r lg:border-b-0`}
        >
          <div className="flex h-full flex-col px-5 py-6">
            <Link
              href="/studio"
              className="font-display text-heading-sm"
              onClick={() => setOpen(false)}
            >
              Twin V Admin
            </Link>
            <p className="text-faint mt-2 text-caption">
              Studio ledger · internal
            </p>
            <nav className="mt-8 flex flex-col gap-3" aria-label="Admin">
              {LINKS.map((l) => {
                const label =
                  l.href === "/studio/founders/a"
                    ? state.settings.founderAName
                    : l.href === "/studio/founders/b"
                      ? state.settings.founderBName
                      : l.label;
                return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="studio-nav-link text-muted hover:text-fg w-fit cursor-pointer text-body-sm transition-colors"
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
                );
              })}
            </nav>
            <div className="mt-auto flex flex-col gap-3 pt-10">
              <label className="text-faint font-mono text-caption uppercase">
                Acting as
                <span className="studio-select-wrap mt-2 block">
                  <select
                    className="studio-select"
                    value={state.settings.actingAs}
                    onChange={(e) =>
                      patchSettings({
                        actingAs: e.target.value as "a" | "b",
                      })
                    }
                  >
                    <option value="a">{state.settings.founderAName}</option>
                    <option value="b">{state.settings.founderBName}</option>
                  </select>
                </span>
              </label>
              <button
                type="button"
                className="btn-ghost rounded-btn-sharp min-h-11 cursor-pointer border-[1.5px] px-4 text-body-sm"
                onClick={() =>
                  patchSettings({ theme: dark ? "light" : "dark" })
                }
              >
                {dark ? "Light mode" : "Dark mode"}
              </button>
              <Link
                href="/"
                className="text-muted hover:text-fg text-caption underline underline-offset-4"
              >
                Back to site
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="px-5 py-4 sm:px-8 lg:px-10">
            <EstimateBanner />
          </div>
          <main id="studio-main" className="px-5 pb-16 sm:px-8 lg:px-10">
            {ready ? (
              children
            ) : (
              <p className="text-muted">Loading ledger…</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
