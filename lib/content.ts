/**
 * All site copy lives here. Edit this file to change the site's words —
 * no component markup needs touching.
 */

/**
 * Order MUST match the vertical order sections actually appear in on the page
 * (see app/page.tsx) — Process, then Work, then Stack, then Services, then
 * About. A menu that jumps backwards is worse than no menu. This list is
 * genuinely coupled to app/page.tsx's section order — if you reorder one,
 * reorder the other.
 *
 * When service pages become real routes (`/services/x`) this scheme changes:
 * an anchor like `#process` only works from the homepage, so cross-page nav
 * items will need to become `/#process` and "Services" likely becomes a real
 * link to a services index rather than an anchor. Flagged, not solved here —
 * there are no subpages yet to design against.
 */
export const nav = {
  brand: "V&V Studio",
  links: [
    { label: "Process", href: "#process" },
    { label: "Work", href: "#work" },
    { label: "Stack", href: "#stack" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
  ],
  cta: { label: "Book a demo", href: "#contact" },
};

export const hero = {
  headline: ["Built to convert.", "Not just to launch."],
  sub: "We design and rebuild websites for companies that outgrew their template. Strategy, design, and production code — shipped in weeks, not quarters.",
  // Not shown yet — proof points go here once there's a track record to cite.
  stats: [
    { value: "40+", label: "Sites shipped" },
    { value: "3–6", label: "Weeks to launch" },
    { value: "2.4X", label: "Median lift in conversion" },
  ],
};

/** Three-beat argument: the spend, the leak, the fix. */
export const problem = {
  items: [
    {
      key: "Traffic",
      body: "You already pay for attention — ads, content, outbound, referrals. Getting people to the site is the part that's working.",
    },
    {
      key: "Gap",
      body: "Then the site loses them. Slow loads, buried value, a form nobody trusts. Most sites convert under 2% and the other 98% is paid for twice.",
    },
    {
      key: "Closed",
      body: "We rebuild around the decision a visitor is actually making. Same traffic, same budget, a site that stops leaking it.",
    },
  ],
};

export const statement = {
  body: "You don't need a rebrand, a new CMS, or a six-month discovery phase.",
  facts: [
    "Design and code by the same hands",
    "Weekly deploys to a live staging URL",
    "You own the repo and every asset",
    "Fixed scope, fixed price, no hourly drift",
  ],
};

export const product = {
  headline: "A studio, not an agency queue",
  body: [
    "Two senior people on your project from the first call to the last deploy — no account layer, no handoff to juniors, no ticket that sits for a week.",
    "We start with the funnel you already have, find where it drops people, and rebuild those screens first. You see working pages in week one, not a slide deck.",
  ],
  // This section is about the studio itself, so its CTA points at the About
  // card (#about) rather than the booking flow — a dedicated /about page
  // isn't built yet (needs real team bios), so this is the honest interim
  // target: it's a real, working link to the existing About content.
  cta: { label: "Meet the studio", href: "#about" },
};

export const pillars = {
  headline: "Three ways in",
  items: [
    {
      title: "Design",
      body: "Positioning, structure, and interface for a site that argues its case. Wireframes to final UI, in your brand or a new one.",
      href: "#contact",
    },
    {
      title: "Build",
      body: "Production Next.js, accessible and fast. Real CMS your team can edit, Core Web Vitals in the green, deployed on your infrastructure.",
      href: "#contact",
    },
    {
      title: "Grow",
      body: "After launch: testing, iteration, and new pages as the offer changes. A retainer that ships, not one that bills for meetings.",
      href: "#contact",
    },
  ],
};

export const cases = {
  headline: "Selected work",
  items: [
    {
      metric: "+142%",
      title: "Rebuilt a SaaS marketing site around one job",
      body: "Cut nine landing pages down to three, rewrote the hero around the buyer's actual trigger, and moved signup above the fold. Trial starts more than doubled in six weeks.",
      tag: "SaaS · Redesign",
    },
    {
      metric: "1.1s",
      title: "Took a storefront from four seconds to one",
      body: "Replaced a plugin-heavy theme with a custom build, trimmed 80% of the JavaScript, and rebuilt the product page. Bounce fell by a third, mobile revenue rose 38%.",
      tag: "E-commerce · Performance",
    },
    {
      metric: "3 wks",
      title: "Launched a studio brand from zero",
      body: "Identity, site, and CMS for a new architecture practice — from empty repo to live and indexed in under a month, ahead of their first pitch.",
      tag: "Brand · New build",
    },
  ],
};

/**
 * Only tools actually used in shipped work by one of the two partners.
 * Deliberately absent, and why — do not re-add without a real project behind it:
 *   Sanity / any CMS — neither partner has shipped one.
 *   Playwright        — a dev dependency with no tests written against it.
 *   Netlify           — a leftover config from an earlier stage; prod is Vercel.
 *   Figma             — kept, but only because the back-end partner genuinely
 *                       works in it; front-end design here is AI-assisted now.
 */
export const stack = {
  headline: "We build on tools your team can keep",
  sub: "No proprietary page builder you can't leave. Everything ships as code you own, on infrastructure you control.",
  groups: [
    {
      title: "Interface",
      items: ["React", "TypeScript", "Next.js", "Vite", "Tailwind", "GSAP", "Vue"],
    },
    {
      title: "Server & data",
      items: ["Spring Boot", "FastAPI", "Firebase", "PostgreSQL", "Redis"],
    },
    {
      title: "Ship & run",
      items: ["Vercel", "Docker", "Git"],
    },
  ],
};

export const services = {
  headline: "Services",
  sub: "Pick the one that matches where you are.",
  items: [
    {
      title: "Website design",
      body: "A new site from strategy through launch, for companies with something to say and nowhere good to say it.",
      meta: "From 4 weeks",
    },
    {
      title: "Redesign",
      body: "Your site works but underperforms. We keep what converts, rebuild what doesn't, and migrate without losing rankings.",
      meta: "From 3 weeks",
    },
    {
      title: "E-commerce",
      body: "Storefronts built for speed and checkout completion. Custom fronts on Shopify or headless, tuned to mobile.",
      meta: "From 6 weeks",
    },
    {
      title: "Brand & identity",
      body: "Logo, type, color, and the rules that keep it consistent — delivered as a system, not a folder of files.",
      meta: "From 3 weeks",
    },
    {
      title: "Care & growth",
      body: "Ongoing design and development. New pages, tests, and fixes on a monthly retainer with a shipping cadence.",
      meta: "Monthly",
    },
  ],
};

export const banners = {
  primary: {
    eyebrow: "Start a project",
    headline: "Tell us what's not working",
    body: "Send the URL and the number you want to move. We'll come back with an honest read on whether we can help — free, no deck.",
    cta: { label: "Start a project", href: "mailto:hello@vandv.studio" },
  },
  secondary: {
    eyebrow: "About us",
    headline: "Two people, a lot of shipped sites",
    body: "V&V Studio is a small design and development practice. We take on a handful of projects at a time so each one gets senior attention.",
    cta: { label: "About us", href: "#about" },
  },
};

export const footer = {
  email: "hello@vandv.studio",
  blurb:
    "A web design and development studio building sites that carry their weight.",
  columns: [
    {
      title: "Services",
      links: [
        { label: "Website design", href: "#services" },
        { label: "Redesign", href: "#services" },
        { label: "E-commerce", href: "#services" },
        { label: "Brand & identity", href: "#services" },
        { label: "Care & growth", href: "#services" },
      ],
    },
    {
      title: "Studio",
      links: [
        { label: "Process", href: "#process" },
        { label: "Work", href: "#work" },
        { label: "Stack", href: "#stack" },
        { label: "About", href: "#about" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "LinkedIn", href: "#" },
        { label: "Instagram", href: "#" },
        { label: "Dribbble", href: "#" },
        { label: "GitHub", href: "#" },
      ],
    },
  ],
  legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Statement", href: "#" },
  ],
};
