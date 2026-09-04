# Twin V Studio — marketing site

Before applying any external design skills, read the global rules at
`~/.ai-studio-playbook.md` (repo copy:
[`AI Design Skills & Architecture Playbook.md`](./AI%20Design%20Skills%20%26%20Architecture%20Playbook.md)).
**This file wins on conflict** — anything in that playbook that contradicts the
rules below is ignored (playbook Rule №0).

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · GSAP.

Single long landing page. Section order lives in `app/page.tsx`; every section is
a component in `components/`, and **all copy lives in `lib/content.ts`** — change
words there, not in markup.

## Design system

Tokens are defined once in `app/globals.css` under `@theme` and come from a
brutalist-editorial system (refero). Use the token utilities (`bg-canvas`,
`text-heading-lg`, `rounded-card`), never raw values.

Hard rules from the system — breaking these breaks the look:

- **No shadows.** Depth comes from surface contrast (canvas → paper → carbon)
  and radius. There is no elevation scale, and none should be added.
- **Page background is `canvas` (#e5e5e5), never pure white.** White is a card
  surface only.
- **Display type is `font-display` (Anton), uppercase, line-height ≤ 0.95.**
  Never mixed case, never below 48px — `globals.css` uppercases `h1/h2/h3`
  automatically.
- **`mint` (#d1ffca) is for tags and links only. `voltage` (#fff100) is for
  micro-accents only.** Neither goes on a large surface. This is why the hero
  blobs put carbon/paper/ash on the big shapes and mint/voltage only on the two
  smallest — the rule held rather than being quietly waived for the visual.
- Borders use color contrast (`border-ash`), not subtle grays on gray.

## Zones and tone

The page is three zones: a light hero, a dark middle, a light close. The dark
one arrives via `components/scroll-panel.tsx`, which widens a rounded background
card into a full-bleed section on scroll. Only the background layer animates —
scaling a section that holds text would drag the type with it.

`ScrollPanel` puts `.tone-dark` on the zone, and sections inside use the role
utilities `text-fg` / `text-muted` / `text-faint` / `border-line` so they work in
either zone without knowing where they landed. A light surface *inside* a dark
zone (the white pillar cards, the mockup's inner panel) must carry `.tone-light`
to reset the roles, or its body copy inherits the zone's pale muted colour onto
white.

Two things that bite here, both already fixed — don't reintroduce them:

- **Never define a role as `--color-x: var(--other-x)` in `@theme`.** A custom
  property is substituted where it is *declared*, so a role written that way
  resolves against `:root`'s tone and inherits that one fixed colour everywhere;
  a later `.tone-dark` override is never seen. `.tone-dark` therefore overrides
  the very same `--color-*` names that `@theme` declares.
- **Only the dark zone owns `data-nav-tone`.** It is a single global slot on
  `<html>`. A light panel also writing to it would fight the dark one, and
  because dev runs effects twice, whichever cleanup ran last would wipe a value
  it never set — which looks exactly like broken CSS.

The nav recolours off that attribute and carries **no Tailwind colour
utilities**: every nav colour comes from a `--nav-*` variable and nothing else
declares it. Overriding a utility from custom CSS is not reliable here (a
`[data-nav-tone] .x` rule loses to `.bg-carbon` in the utilities layer), so the
fix is to remove the competition rather than try to outrank it.

## Fonts

Anton / Inter / JetBrains Mono are free stand-ins for the licensed Suisse Intl
family, chosen from the design system's own fallback list. To switch to the real
faces, replace the three `next/font/google` calls in `app/layout.tsx` with
`next/font/local` — the CSS variable names (`--font-anton`, `--font-inter`,
`--font-jetbrains`) are what `@theme` binds to, so nothing else changes.

Anton has a limited glyph set (no `×`, no Cyrillic). If display copy ever needs
either, the display face must change.

## Motion

GSAP 3.15 with **all former Club plugins free** (MorphSVG, ScrollSmoother,
SplitText, DrawSVG, Flip, Observer, CustomEase…). No extra install, and no
`lenis` — ScrollSmoother is ScrollTrigger-native.

Shared vocabulary lives in `lib/motion.ts`: `MOTION_OK`, `HOVER_OK`, `REVEAL`,
`PANEL_OVERHANG_VH`. **That file must never import GSAP** — server components
read from it, and an import would drag the plugin set into every client chunk.

Entry points:

- `components/reveal.tsx` — scroll-reveals descendants carrying `.reveal`, via
  `ScrollTrigger.batch` (a trigger per element, not one per section — a wrapper
  trigger fires a tall section's last row long before it is on screen).
- `components/hero.tsx` — its own load-in timeline.
- `components/hero-blobs.tsx` + `lib/blob.ts` — the morphing blobs.
- `components/pillar-card.tsx` + `pillar-visual.tsx` — looping pillar art.
- `components/scroll-panel.tsx` — the zone transition (scrubbed, see above).
- `components/smooth-scroll.tsx` — ScrollSmoother + delegated anchor handling.

Everything that *hides* something calls `isDocumentVisible()` first. **Keep that
check.** GSAP advances on `requestAnimationFrame`, which does not fire in a
background tab; without the guard the "from" state is applied and then freezes,
leaving a blank page for anyone who opened the site in a background tab. The
hidden state is applied by GSAP rather than CSS for the same reason — if the
bundle never loads, content is simply visible. In `reveal.tsx` the guard must
stay **above** the `gsap.set` that pre-hides the batch, or below-fold content is
invisible forever in a background tab.

Interactions (button sweep, pillar hover) deliberately skip that guard — they
can't leave the page broken, and a hidden tab can't be hovered.

### Rules that are easy to undo by accident

- **`<Nav />` must stay outside `<SmoothScroll>`.** ScrollSmoother transforms
  `#smooth-content`, and a transformed ancestor becomes the containing block for
  `position: fixed` — a nav inside would scroll away with the page.
- **Never add `scroll-behavior: smooth`.** It fights ScrollSmoother and degrades
  ScrollTrigger scrubbing. Anchor offsets come from `scroll-margin-top` +
  `--nav-height`.
- **`--nav-height` is the single source for the bar height.** It was hard-coded
  as `96px` in two places that could drift; `scroll-panel.tsx` and
  `smooth-scroll.tsx` both parse the token now.
- **Mobile scroll lock targets `documentElement`, not `body`.** ScrollSmoother
  gives `body` an explicit height and the scroller becomes `html`.
- **Don't run CSS and GSAP transforms on the same element.** Tailwind v4
  compiles `scale-110` to the standalone `scale:` property while GSAP writes
  `transform: scale()` — they multiply. GSAP owns the pillar transforms.
- **`[data-fill]` on buttons is progressive enhancement.** `components/button.tsx`
  sets it only when the JS sweep is live, and `.btn-*:not([data-fill]):hover` in
  `globals.css` is the fallback. It must be removed in the matchMedia cleanup —
  `mm.revert()` reverts tweens, not attribute writes.
- **No `will-change` on morphed paths.** A morph is a geometry change, not a
  composited transform; the layer is wasted.
- **The dark panel's overhang and its nav-tone trigger move together.** The black
  extends `PANEL_OVERHANG_VH` past its section so the light panel has something
  to arrive over; the nav-tone `end` must clear the same distance or the nav
  flips light while still over black.

## Layout width

Sections are **uncapped** — `.shell` is `width: 100%` with `padding-inline:
var(--shell-padding)` (32px) and no `max-width`. The nav bar uses its own
tighter `--nav-padding` (20px). This was deliberate, not an oversight: the
reference (dayos.com) runs edge-to-edge on real monitors with only a ~32px
gutter, not a centered 1200px container. If a max-width ever comes back, keep
the two gutter sizes distinct — do not silently reuse `--shell-padding` for
the nav.

## Nav bar

The bar itself is a full-bleed strip whose background is **always solid and
exactly equal to the current zone's page background** (canvas or carbon) — it
is not a floating card, and it does not go translucent/blurred at the top of
the page. That's what makes sections appear to scroll *behind* it rather than
past a visible edge. Only the link cluster sits in its own pill
(`.nav-pill`), a shade off the bar, and the brand mark and CTA sit directly on
the bar with no container of their own. Don't reintroduce a wrapping pill
around the whole header — that was tried and explicitly rejected.

## Restraint

The hero has no tag/badge, no CTA buttons, and no stat row — the reference
doesn't have them on the first screen either. `hero.stats` still exists in
`lib/content.ts` (unused) for when proof points exist to cite; don't delete it,
but don't render it without being asked.

Section index badges (`01`, `02`, `03`) and hairline `border-t` dividers
between grid items were removed from Problem/Pillars/Services — they read as
generic AI-template filler. Don't add that pattern back to new sections;
separate items with spacing and, where useful, a hover state instead.

## Notes

- `turbopack.root` is pinned in `next.config.ts` because an unrelated
  `package-lock.json` in the home directory otherwise gets picked as the
  workspace root.
- Section visuals (e.g. the browser mockup in `components/product.tsx`) are
  built from CSS surfaces, not images. Swap them for real work screenshots.
- Studio email is `contact@twinvstudio.com` in `lib/content.ts`. Social links
  there are still placeholders.
- The homepage brief emails via Gmail from `app/api/brief/route.ts` when
  `TWINV_GOOGLE_CLIENT_ID`, `TWINV_GOOGLE_CLIENT_SECRET`,
  `TWINV_GOOGLE_REFRESH_TOKEN`, and `TWINV_MAIL_TO` are set (Vercel env).
  Without those, `next dev` still forwards to FastAPI on `:8000`. Never put
  those keys in `NEXT_PUBLIC_*` or in git.

## Commits

**Before any `git commit` or `git push`, read `Conventional Commits.md` in the
repo root in full, then follow it.** Do not write a commit message from this
summary or from memory. That file is the source; this section is only the
reminder to open it, plus two project facts it does not cover:

- Scopes in use: `about`, `hero`, `nav`, `footer`, `motion`, `tokens`,
  `content`, `services`, `work`. Omit the scope for repo-wide chores.
- **Author identity matters for deploys.** Vercel is on a Hobby plan, which only
  accepts deployments whose commit author has access to the project — the account
  is `kidlav2`. Commits made as `kidlav` (`valdik20032944@gmail.com`) are blocked
  with "the commit author does not have contributing access". This repo therefore
  pins `user.email` to `264042178+kidlav2@users.noreply.github.com` locally; if
  you clone it fresh, set that again before committing.
