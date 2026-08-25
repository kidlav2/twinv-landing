/**
 * All site copy lives here. Edit this file to change the site's words —
 * no component markup needs touching.
 */

/**
 * Order MUST match the vertical order sections actually appear in on the page
 * (see app/page.tsx) — Home (the landing's top), then Process, then Work,
 * then Stack, then Services, then About. A menu that jumps backwards is worse
 * than no menu. This list is genuinely coupled to app/page.tsx's section
 * order — if you reorder one, reorder the other.
 *
 * Home is `/#top`, not `/`. A bare `/` from another route would land the
 * homepage wherever the new SmoothScroll wrapper happened to open; the hash
 * is what the smoother honours as an explicit scrollTo. It is also why
 * Process cannot do this job: from /about, `/#process` is a correct jump
 * that skips the hero, and that is the thing a visitor clicking the first
 * item to "go back" actually wanted to see.
 *
 * When service pages become real routes (`/services/x`) this scheme changes:
 * an anchor like `#process` only works from the homepage, so cross-page nav
 * items will need to become `/#process` and "Services" likely becomes a real
 * link to a services index rather than an anchor. Flagged, not solved here —
 * there are no subpages yet to design against.
 */
export const nav = {
  brand: "Twin V Studio",
  /* `/#id`, not `#id`: the nav renders on every route via PageShell (see
     components/page-shell.tsx), so a bare hash — which the smooth-scroll
     click handler only resolves against the CURRENT page — would append
     harmlessly to /about or /services/x and scroll nowhere. The homepage's
     own components (Pillars, ServicesGrid, Brief…) can still use bare `#id`,
     because they only ever render on `/`. /about is a real route now that
     the page exists. */
  links: [
    { label: "Home", href: "/#top" },
    { label: "Process", href: "/#process" },
    { label: "Work", href: "/work" },
    { label: "Stack", href: "/#stack" },
    { label: "Services", href: "/#services" },
    { label: "About", href: "/about" },
  ],
  cta: { label: "Book a demo", href: "/#contact" },
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
  // Pointed at the About card until that card was removed. /about is the real
  // destination once it exists (stage 3); until then the closing form is the
  // only honest place to send someone who wants to talk to the studio.
  cta: { label: "Meet the studio", href: "/about" },
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

/**
 * Portfolio. Consumed by three surfaces: the `#work` teaser on the homepage,
 * the `/work` index, and one `/work/[slug]` page per entry.
 *
 * !!! EVERY ENTRY BELOW IS A PLACEHOLDER. Replace with real work before this
 * ships. The three rules that keep the section honest — none of them are
 * style preferences:
 *
 *   `kind` is the one field that must never be fudged. "client" means someone
 *   paid for it and it runs their business. "self" means we built it for
 *   ourselves. Self-initiated work belongs here — it is the studio's own
 *   product, not a lesser exhibit — but it can never be dressed as an
 *   engagement: no invented company, no testimonial, no business number,
 *   because there was no business to measure it on. `client` and `sector` are
 *   optional for exactly that reason.
 *
 *   `metric.label` is not a caption, it names what the number IS. That is what
 *   lets a business result (+142%, trial starts) and a technical fact (1.1s,
 *   largest contentful paint) share one slot on the card without pretending to
 *   be the same kind of claim. Client work takes the business number;
 *   self-initiated work takes a fact measurable on the thing itself. Never the
 *   reverse — a percentage with no client behind it is the one lie a visitor
 *   can catch from the outside.
 *
 *   `type` is the outcome — Website / Automation / Growth — not the craft. The
 *   studio sells business change, so someone who arrived needing automation has
 *   to find themselves in the grid. The old tags ("SaaS · Redesign") sorted the
 *   work by how WE built it, which is the single axis a buyer does not care
 *   about.
 */
export const work = {
  headline: "Selected work",
  sub: "Three projects, and what changed because of them.",
  /** Label for the link from the homepage teaser to the full index. */
  more: "All work",
  items: [
    {
      slug: "saas-marketing-site",
      title: "Rebuilt a SaaS marketing site around one job",
      kind: "client",
      client: "Client name",
      sector: "SaaS",
      year: "2026",
      type: "Website",
      summary:
        "Nine landing pages cut down to three, the hero rewritten around the buyer's actual trigger, and signup moved above the fold.",
      metric: { value: "+142%", label: "trial starts" },
      role: "Strategy, design, build",
      stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
      url: "",
      task: "The site had grown one landing page per campaign until there were nine, each arguing a different case for the same product. Traffic was fine. Nobody could tell which page was doing the work, and the trial signup sat two scrolls down on all of them.",
      approach: [
        {
          label: "One page per decision",
          body: "We mapped the nine pages onto the three decisions a buyer actually makes, and wrote one page for each. The other six redirected rather than lingering as dead weight in search.",
        },
        {
          label: "The hero says the trigger",
          body: "The old hero described the product. The new one names the moment a buyer goes looking for it, which is the sentence they are already saying to themselves.",
        },
        {
          label: "Signup where the decision happens",
          body: "The trial form moved to the first screen and repeats at the point in the page where the argument finishes, instead of waiting at the bottom.",
        },
      ],
      outcome:
        "Trial starts more than doubled over six weeks against the same ad spend, and the team stopped shipping a new landing page for every campaign.",
      outcomeFacts: [
        { value: "6 wks", label: "to measurable change" },
        { value: "9 → 3", label: "landing pages" },
      ],
    },
    {
      slug: "storefront-performance",
      title: "Took a storefront from four seconds to one",
      kind: "self",
      client: "",
      sector: "E-commerce",
      year: "2025",
      type: "Growth",
      summary:
        "A plugin-heavy theme replaced with a custom build: 80% of the JavaScript gone and the product page rebuilt from scratch.",
      metric: { value: "1.1s", label: "largest contentful paint" },
      role: "Design, build",
      stack: ["Next.js", "TypeScript", "PostgreSQL", "Vercel"],
      url: "",
      task: "The store loaded in four seconds on a mid-range phone, and most of that was theme plugins doing work nobody had asked for since launch. Every fix so far had been another plugin.",
      approach: [
        {
          label: "Audit before rewrite",
          body: "We measured what each plugin cost in bytes and blocking time before deciding anything, so the rewrite replaced known weight rather than assumed weight.",
        },
        {
          label: "Custom build, owned as code",
          body: "The theme became a custom front end the team can read and change — no builder to renew, and nothing that breaks on a plugin's own release schedule.",
        },
        {
          label: "The product page first",
          body: "The page that converts got rebuilt before anything decorative, because a fast homepage in front of a slow product page moves no revenue.",
        },
      ],
      outcome:
        "Load time dropped from roughly four seconds to just over one on the same connection, and the JavaScript bundle shrank by about 80%.",
      outcomeFacts: [
        { value: "−80%", label: "JavaScript shipped" },
        { value: "4s → 1.1s", label: "load on mid-range mobile" },
      ],
    },
    {
      slug: "studio-brand-launch",
      title: "Launched a studio brand from an empty repo",
      kind: "self",
      client: "",
      sector: "Brand",
      year: "2025",
      type: "Website",
      summary:
        "Identity, site, and content model for a new practice — from nothing to live and indexed inside a month.",
      metric: { value: "3 wks", label: "empty repo to live" },
      role: "Identity, design, build",
      stack: ["Next.js", "GSAP", "Tailwind", "Vercel"],
      url: "",
      task: "A new practice needed to exist publicly before its first pitch, with no logo, no copy, and no photography — and a date that was not going to move.",
      approach: [
        {
          label: "Type instead of photography",
          body: "With no photography to build on, the identity was set in type and flat surface contrast, which meant the site could be finished without waiting on a shoot.",
        },
        {
          label: "Copy written to the pitch",
          body: "The pages were written against the argument the practice was already making in the room, so the site and the pitch said the same thing.",
        },
        {
          label: "One content file",
          body: "Every word on the site lives in one file the team edits directly, so the first month of changes needed no developer.",
        },
      ],
      outcome:
        "Live and indexed in three weeks, ahead of the first pitch, and edited by the practice itself from week one.",
      outcomeFacts: [{ value: "0", label: "developer hours to edit copy" }],
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
      items: [
        "React",
        "TypeScript",
        "Next.js",
        "Vite",
        "Tailwind",
        "GSAP",
        "Vue",
      ],
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

/**
 * `slug` is the routing key for /services/[slug] (app/services/[slug]/page.tsx)
 * and the thing footer.columns' Services links and the homepage cards both
 * point at — one id, three call sites, so renaming a service means changing
 * it in exactly one place.
 *
 * `intro` and `included` only render on the detail page; the card on the
 * homepage grid keeps using `body`. No `approach`/step-by-step process here —
 * that already exists once, as `pillars`, and restating it per-service would
 * just be the same three paragraphs six times.
 */
export const services = {
  headline: "Services",
  sub: "Pick the one that matches where you are.",
  items: [
    {
      slug: "website-design",
      title: "Website design",
      body: "A new site from strategy through launch, for companies with something to say and nowhere good to say it.",
      meta: "From 4 weeks",
      intro:
        "You're describing the business in a deck or a doc, not on the site — or the site was built for a version of the company that no longer exists. We start from the argument the business needs to make, not a template, and build the pages that make it.",
      included: [
        {
          label: "Positioning & IA",
          body: "Positioning and information architecture before any screen design.",
        },
        {
          label: "Full-page design",
          body: "Full-page designs for the pages that carry the argument, not just the homepage.",
        },
        {
          label: "Production build",
          body: "Production build in Next.js — the same stack this site runs on.",
        },
        {
          label: "Copy direction",
          body: "Copy direction and editing, so launch doesn't wait on a separate writer.",
        },
        {
          label: "Analytics & staging",
          body: "Analytics and a staging environment for a real look before it's public.",
        },
      ],
    },
    {
      slug: "redesign",
      title: "Redesign",
      body: "Your site works but underperforms. We keep what converts, rebuild what doesn't, and migrate without losing rankings.",
      meta: "From 3 weeks",
      intro:
        "A redesign is not a repaint. We start by finding what the current site is already doing right — the pages that rank, the flows that convert — and rebuild around that, not over it. Nothing that already works gets thrown out for the sake of new.",
      included: [
        {
          label: "Traffic audit",
          body: "An audit of current traffic, rankings, and conversion paths before any redesign work.",
        },
        {
          label: "Migration plan",
          body: "A redirect and migration plan, so URLs that rank keep ranking.",
        },
        {
          label: "Staged rebuild",
          body: "Section-by-section rebuild, so the site can ship in pieces instead of one long freeze.",
        },
        {
          label: "Before & after",
          body: "Before/after comparison on the metrics that mattered going in.",
        },
      ],
    },
    {
      slug: "ecommerce",
      title: "E-commerce",
      body: "Storefronts built for speed and checkout completion. Custom fronts on Shopify or headless, tuned to mobile.",
      meta: "From 6 weeks",
      intro:
        "Most storefront themes are built for a catalog, not your catalog. We build the front end around how your specific products actually get chosen and bought, on Shopify when that's the right fit or headless when it isn't, with checkout treated as its own design problem.",
      included: [
        {
          label: "Custom storefront",
          body: "Custom storefront on Shopify, or a headless front end over the commerce platform you already run.",
        },
        {
          label: "Checkout rebuild",
          body: "Checkout and cart flow audited and rebuilt for completion, not just appearance.",
        },
        {
          label: "Scaling templates",
          body: "Product and collection templates that scale past the handful you'll launch with.",
        },
        {
          label: "Mobile-first build",
          body: "Mobile-first build and testing — most of the traffic arrives on a phone.",
        },
      ],
    },
    {
      slug: "brand-identity",
      title: "Brand & identity",
      body: "Logo, type, color, and the rules that keep it consistent — delivered as a system, not a folder of files.",
      meta: "From 3 weeks",
      intro:
        "A logo file isn't a brand. We deliver the rules that make the mark, the type, and the color hold together across a website, a deck, and a business card without someone having to guess — a system your team or the next agency can actually use.",
      included: [
        {
          label: "Mark & wordmark",
          body: "Mark, wordmark, and the construction rules that keep them from being redrawn wrong.",
        },
        {
          label: "Type & color",
          body: "Type and color system, with the roles each one plays, not just the values.",
        },
        {
          label: "Written guide",
          body: "A written guide covering the cases people actually get wrong.",
        },
        {
          label: "Applied in build",
          body: "Applied to the website itself, not handed off as a theoretical document.",
        },
      ],
    },
    {
      slug: "care-growth",
      title: "Care & growth",
      body: "Ongoing design and development. New pages, tests, and fixes on a monthly retainer with a shipping cadence.",
      meta: "Monthly",
      intro:
        "A site is a product, not a project that ends at launch. This is the retainer for the work that comes after: new landing pages, fixes, small tests, the backlog that never quite gets prioritized on a one-off contract. A fixed cadence, not an open-ended favor.",
      included: [
        {
          label: "Monthly hours",
          body: "A monthly block of design and development hours, scoped before the month starts.",
        },
        {
          label: "Shipping cadence",
          body: "A shipping cadence — agreed dates, not a queue that quietly slips.",
        },
        {
          label: "Priority fixes",
          body: "Priority turnaround on fixes, ahead of new project work.",
        },
        {
          label: "Shipped log",
          body: "A running log of what shipped, so the retainer stays accountable to itself.",
        },
      ],
    },
    {
      slug: "process-automation",
      title: "Process automation",
      body: "The work behind the site: integrations, queues, and scheduled jobs, plus the dashboards to watch them from.",
      meta: "From 5 weeks",
      intro:
        "The site is the part visitors see. This is the part that keeps it running: the integrations between your tools, the scheduled jobs that used to be a person's Tuesday morning, and a dashboard so the work is visible instead of trusted blindly.",
      included: [
        {
          label: "Tool integrations",
          body: "Integrations between the tools your team already uses — CRM, billing, support.",
        },
        {
          label: "Jobs & queues",
          body: "Scheduled jobs and queues for work that shouldn't depend on someone remembering.",
        },
        {
          label: "Ops dashboard",
          body: "A dashboard to see what ran, what failed, and why.",
        },
        {
          label: "Own the infra",
          body: "Built on infrastructure your team can read and maintain, not a black box.",
        },
      ],
    },
  ],
};

/** Renders at /about (app/about/page.tsx). */
export const about = {
  eyebrow: "About us",
  /**
   * Split into two spans because the first one carries the voltage marking —
   * which phrase gets marked is a copy decision, so it lives here rather than
   * being hard-coded into the markup as a `<span>` around a substring.
   */
  headline: { marked: "Two people", rest: ", a lot of shipped sites" },
  /**
   * The beat between the masthead and the laptop. Three verbs, no adjectives:
   * it has to read at display scale in one pass, and the laptop's `claim`
   * immediately after is the sentence that qualifies it.
   */
  prelude: "We design it, build it, and ship it.",
  /**
   * The line the laptop's screen holds, and the only copy on the site set at
   * full display scale on its own. ASCII only and short on purpose: Anton has
   * a limited glyph set, and this is read at ~100px where every extra word
   * costs a line.
   */
  claim: "We kept the studio small on purpose.",
  /**
   * The page's own contents. Deliberately not numbered — these are three
   * places to land, not three steps in a sequence, and index badges are the
   * template pattern AGENTS.md rules out.
   */
  toc: [
    { label: "The studio", href: "#about-studio" },
    { label: "How we work", href: "#about-work" },
    { label: "The two of us", href: "#about-us" },
  ],
  intro:
    "Twin V Studio is a small design and development practice. We take on a handful of projects at a time so each one gets senior attention — the same two people from the first call to the last deploy, not an account manager handing you off to whoever is free.",
  body: "That's a deliberate ceiling, not a stage we're passing through. A studio that stays small stays close to the work: no bench of juniors to keep billable, no layer of process between what you ask for and what ships.",
  /**
   * `marked` is the voltage band. Exactly one of the three carries it: three
   * marked titles in a column stopped being an accent and became the list's
   * default styling, which is the opposite of what a highlight is for. The
   * flag is on every entry (rather than optional on one) so the field is part
   * of the shape and TypeScript can see it on each element.
   */
  points: [
    {
      title: "Senior on every project",
      marked: true,
      body: "No junior does the first pass and a senior the review. The people who scope the work are the people who build it.",
    },
    {
      title: "Production code, not a prototype",
      marked: false,
      body: "What ships in week one is the real stack — Next.js, deployed on your infrastructure — not a Figma file waiting for a second contract.",
    },
    {
      title: "A handful of projects at a time",
      marked: false,
      body: "We turn down work rather than stretch thin. If we take the call, you get real attention on a real timeline.",
    },
  ],
  /**
   * The closing section. Cards are a name and a short role — not a CV. The
   * longer split (automation, the brief, who talks to the client) lives in
   * `body`, because a caption that lists five jobs wraps into a paragraph
   * on a 260px phone card and stops being a label.
   *
   * First names only, and Vanya not Ivan: the mark is Twin V because it is
   * Vlad and Vanya, and those are the names a client will actually use.
   */
  founders: {
    eyebrow: "The two of us",
    headline: "Who you actually get",
    body: "Two senior people, both hands-on. Vlad leads design and front-end, Vanya leads back-end and infrastructure — and on a project this size that split is a conversation, not a handoff. You talk to both of us, for the whole engagement.",
    cards: [
      { name: "Vlad", role: "Design and front-end" },
      { name: "Vanya", role: "Back-end" },
      { name: "Vlad & Vanya", role: "The two of us" },
    ],
  },
  cta: { label: "Start a project", href: "/#contact" },
};

export const legal = {
  updated: "23 August 2026",
  terms: {
    title: "Terms of Service",
    intro:
      "These terms cover the use of vandv.studio and any brief you submit through it. They don't cover a signed client contract or statement of work — where one exists, its terms govern.",
    sections: [
      {
        title: "Using this site",
        body: "This site is informational and exists to describe Twin V Studio's work and to receive project briefs through the form at the bottom of the homepage. Don't use it to submit anything unlawful, anything you don't have the right to send, or anything intended to disrupt the site or the people running it.",
      },
      {
        title: "The brief form",
        body: "Submitting a brief is a request for a conversation, not an order, invoice, or binding commitment on either side. We reply to every brief we receive; a reply isn't an acceptance of work. Actual engagements are agreed separately, in writing, before any work starts.",
      },
      {
        title: "Content and ownership",
        body: "The design, copy, and code of this site belong to Twin V Studio unless credited otherwise. Case studies and names shown here are used with permission. Deliverables from a paid engagement are covered by that engagement's own agreement, not by these terms.",
      },
      {
        title: "No warranty",
        body: "This site is provided as-is. We've tried to keep it accurate and working, but we don't promise it will be uninterrupted, error-free, or fit for a particular purpose beyond what it plainly does.",
      },
      {
        title: "Changes",
        body: "We may update these terms as the site or the studio's practices change. The date at the top of this page reflects the last revision.",
      },
      {
        title: "Contact",
        body: "Questions about these terms can go to hello@vandv.studio.",
      },
    ],
  },
  privacy: {
    title: "Privacy Statement",
    intro:
      "This is a short statement because there isn't much to disclose: this site doesn't run analytics, doesn't set tracking cookies, and doesn't share anything with an ad network. The only data it collects is what you type into the brief form, and the only reason we keep it is to reply to you.",
    sections: [
      {
        title: "What we collect",
        body: "The brief form asks for your name, email address, what you need, and optionally your current site's URL. That's the whole set — see the form itself for the exact fields. We don't collect anything passively: no cookies, no analytics pixels, no third-party scripts on this site.",
      },
      {
        title: "How we use it",
        body: "To read your brief and reply to the email address you gave us. Nothing is added to a marketing list, and nothing is sold or shared with a third party.",
      },
      {
        title: "How long we keep it",
        body: "Brief submissions are kept as long as they're useful to the conversation they started — typically the length of an active discussion or engagement — and deleted when they're not.",
      },
      {
        title: "Your rights",
        body: "You can ask what we hold about you, ask us to correct it, or ask us to delete it, at any time, by writing to hello@vandv.studio.",
      },
      {
        title: "Changes",
        body: "If this statement changes in a way that matters — for example, if the no-cookies, no-analytics line above stops being true — the date at the top of this page will move and we'll say what changed.",
      },
    ],
  },
};

/**
 * The brief form at the foot of the page.
 *
 * `goals[0]` is the default selection; the nav CTA carries
 * `data-brief-goal="demo"` so arriving from "Book a demo" preselects that one
 * instead. Goal ids are part of the payload contract — see lib/brief.ts — so
 * renaming one is a backend-visible change, while `label` is free text.
 */
export const brief = {
  /* "Start a project" and "Start a brief" were two names for one action, on
     two adjacent cards. One name now, and it matches every button that leads
     here. */
  eyebrow: "Start a project",
  headline: "Tell us what you need",
  sub: "Send the URL and the number you want to move. We'll come back with an honest read on whether we can help — free, no deck.",
  goalLegend: "What do you need?",
  goals: [
    { id: "new-site", label: "New site" },
    { id: "redesign", label: "Redesign" },
    { id: "audit", label: "Audit" },
    { id: "demo", label: "Demo" },
  ],
  fields: {
    site: {
      label: "Current site",
      hint: "Optional",
      placeholder: "vandv.studio",
    },
    message: {
      label: "What is not working?",
      placeholder:
        "The number you want to move, and what you think is in the way.",
    },
    name: { label: "Name", placeholder: "" },
    email: { label: "Email", placeholder: "" },
  },
  errors: {
    goal: "Pick one so we know where to start.",
    message: "A sentence or two is plenty.",
    name: "We would rather not open with \u201cHi there\u201d.",
    email: "We need somewhere to reply.",
    emailFormat: "That address is missing something.",
    submit: "That did not send. Try again, or email us directly.",
  },
  submit: "Send the brief",
  sending: "Sending\u2026",
  success: {
    headline: "Got it",
    body: "We read every one of these ourselves. Expect a reply within two working days.",
  },
  /* Shown under the button. Not a consent checkbox: we are not setting a
     cookie or subscribing anyone, so a checkbox would be theatre. */
  note: "We use this to reply. Nothing else, and no list.",
};

export const footer = {
  email: "hello@vandv.studio",
  blurb:
    "A web design and development studio building sites that carry their weight.",
  /* The Services links used to be six identical `#services` anchors — every
     one of them scrolled to the same spot on the homepage. Now that
     /services/[slug] pages exist (see the `slug` field above), each link
     goes to its own page. `services.items` is the single source for both;
     nothing here restates a title or href by hand. */
  columns: [
    {
      title: "Services",
      links: services.items.map((s) => ({
        label: s.title,
        href: `/services/${s.slug}`,
      })),
    },
    {
      title: "Studio",
      links: [
        { label: "Home", href: "/#top" },
        { label: "Process", href: "/#process" },
        { label: "Work", href: "/work" },
        { label: "Stack", href: "/#stack" },
        { label: "About", href: "/about" },
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
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Statement", href: "/privacy" },
  ],
};
