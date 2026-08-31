/**
 * All site copy lives here. Edit this file to change the site's words —
 * no component markup needs touching.
 */

/**
 * Short global nav: destinations, not every homepage section. Process and
 * Stack stay on the landing and are reached by scroll.
 *
 * Home is `/#top`, not `/`. A bare `/` from another route would land the
 * homepage wherever the new SmoothScroll wrapper happened to open; the hash
 * is what the smoother honours as an explicit scrollTo.
 *
 * Services points at the first service page (`services.items[0]`), not the
 * homepage `#services` teaser. A hash next to real routes was the mix that
 * made the bar feel broken. When a services index ships, change this href.
 */
export const nav = {
  brand: "Twin V Studio",
  /* `/#id`, not `#id`: the nav renders on every route via PageShell (see
     components/page-shell.tsx), so a bare hash — which the smooth-scroll
     click handler only resolves against the CURRENT page — would append
     harmlessly to /about or /services/x and scroll nowhere. The homepage's
     own components (Pillars, ServicesGrid, Brief…) can still use bare `#id`,
     because they only ever render on `/`. */
  links: [
    { label: "Home", href: "/#top" },
    { label: "Work", href: "/work" },
    /* First entry in `services.items` below. Keep in sync if that order changes. */
    { label: "Services", href: "/services/website-design" },
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
      href: "/services/website-design",
    },
    {
      title: "Build",
      body: "Production Next.js, accessible and fast. Real CMS your team can edit, Core Web Vitals in the green, deployed on your infrastructure.",
      href: "/services/redesign",
    },
    {
      title: "Grow",
      body: "After launch: testing, iteration, and new pages as the offer changes. A retainer that ships, not one that bills for meetings.",
      href: "/services/care-growth",
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
 *   `metric` still sits only on the homepage teaser hover. `outcomeFacts`
 *   land on the case page under "What changed", next to the outcome
 *   paragraph — they are the proof for that beat, and they give the
 *   timeline the height the short copy would not. They stay off the `/work`
 *   index. Every number below is still a placeholder; swap the strings
 *   when the figures are real.
 *
 *   `metric.label` is not a caption, it names what the number IS. That is what
 *   lets a business result (+142%, trial starts) and a technical fact (1.1s,
 *   largest contentful paint) share one slot without pretending to be the same
 *   kind of claim. Client work takes the business number; self-initiated work
 *   takes a fact measurable on the thing itself. Never the reverse — a
 *   percentage with no client behind it is the one lie a visitor can catch
 *   from the outside.
 *
 *   `type` is the outcome — Website / Automation / Growth / App — not the
 *   craft. The studio sells business change, so someone who arrived needing
 *   automation has to find themselves in the grid. The old tags ("SaaS ·
 *   Redesign") sorted the work by how WE built it, which is the single axis a
 *   buyer does not care about.
 *
 *   `family` groups several cases from one engagement. The hub lives in
 *   `families` (a table of contents, not a fifth timeline). Children point at
 *   that slug. The homepage teaser reads `teaser`, not the full `items` list —
 *   a four-product engagement must not occupy the whole track.
 *
 *   `url` is the live site. The case page treats the screenshot as that
 *   link; an empty string would be a click into nowhere, so every entry
 *   carries a URL. Placeholders (`example.com/...`) are fine until the real
 *   address lands — swap the string, nothing else changes.
 *
 *   `gallery` is extra shots on the case page, after the timeline. The hero
 *   `image` is already on the first screen, so this list is more of the
 *   same site — interiors, mobile, a second page. Leave it `[]` until those
 *   files exist; the gallery then shows `image` alone rather than inventing
 *   a second drawing. Drop files next to the hero shot in `public/work/`.
 *
 *   `image` is the screenshot, and on the `/work` index it carries the weight
 *   the metric used to. Files live in `public/work/<slug>.png`; swapping a
 *   file is enough, the path is all any surface reads. Required in practice:
 *   the teaser card renders it directly, so an empty string breaks that card.
 *   The index and the case page go through `WorkStill`, which falls back to
 *   the CSS drawing for that slug. Shoot wide — about 3:2 and at least 1600px
 *   across — since the index crops to 3:2 and the case page to 4:3.
 */
export const work = {
  headline: "Selected work",
  sub: "The work, and what changed because of it.",
  /** Label for the link from the homepage teaser to the full index. */
  more: "All work",
  /** External link on `/work/[slug]`. The screenshot is the same action. */
  visit: "Visit the site",
  /** Sticky titles on the case-study timeline. Display size, not captions. */
  beats: {
    problem: "The problem",
    did: "What we did",
    changed: "What changed",
    stack: "The stack",
  },
  /** Heading above the screenshot strip that follows the timeline. */
  frames: "Selected frames",
  pager: {
    prev: "Previous project",
    next: "Next project",
  },
  /** Hub layer switcher — mint tag active, ash tags idle. */
  layers: {
    legend: "Surfaces",
  },
  /** Closing panel on `/work` and each case study. */
  close: {
    headline: "Tell us what you need to move",
    body: "Send the URL and the number you want to change. We'll come back with an honest read on whether we can help.",
    cta: { label: "Start a project", href: "/#contact" },
  },
  /**
   * Homepage `#work` track. Deliberately not `items` — otherwise a
   * four-product engagement would be the whole teaser.
   */
  teaser: [
    "velocult",
    "saas-product",
    "studio-brand-launch",
  ],
  /**
   * One engagement, several surfaces. The hub is `/work/[slug]`; each child
   * slug is a full case in `items`.
   */
  families: [
    {
      slug: "velocult",
      title: "Replace paper journals with one system the whole shop runs on",
      summary:
        "Replaced handwritten journals with one SaaS the shop actually runs on: courier e-bike rental, bike and parts sales, and workshop. Several doors, one record, no second book to copy into.",
      kind: "client",
      client: "VeloCult",
      sector: "Logistics",
      year: "2026",
      type: "SaaS",
      image: "",
      gallery: [],
      metric: { value: "3", label: "jobs on one record" },
      role: "Strategy, product, design, build",
      stack: ["Python", "FastAPI", "React", "SQLite", "SQLAlchemy"],
      url: "https://вело-культ.рф",
      task: "Paper journals ran rental, sales, and workshop as separate handwritten books. Staff copied the same bike into more than one place, and a shop that rents to couriers around the clock cannot pause while someone finds the right page. The job was not a brochure. It was getting the whole operation onto one record.",
      approach: [
        {
          label: "One product because it is one shop",
          body: "Rental, sales, and workshop already share bikes, people, and money. Three disconnected tools would recreate the journals. One system holds the business, not a pile of apps.",
        },
        {
          label: "Several doors, one record",
          body: "Customers and staff come in through different doors. They hit the same bikes and the same jobs. A rental on the street and a note in the workshop cannot disagree.",
        },
        {
          label: "The journal becomes the way the shop works",
          body: "Paper was the workflow, not a backup. The product takes that job: who has the bike, what was sold, what is in the workshop — in one place at 2am as well as at noon.",
        },
      ],
      outcome:
        "Staff stopped running the shop from handwritten books. Rental, sales, and workshop now live in one system the business works in day to day.",
      outcomeFacts: [
        { value: "3", label: "jobs on one record" },
        { value: "1", label: "system instead of handwritten books" },
        { value: "24h", label: "rental that no longer waits on a page" },
      ],
      children: [
        "velocult-site",
        "velocult-catalog",
        "velocult-crm",
        "velocult-android",
      ],
      layers: [
        { id: "saas", label: "SaaS" },
        { id: "website", label: "Website", slug: "velocult-site" },
        { id: "crm", label: "CRM", slug: "velocult-crm" },
      ],
    },
    {
      slug: "saas-product",
      title: "Ship a SaaS as one product, not a site, an app, a landing, and a bot that do not share an account",
      summary:
        "Four doors into one product: the marketing site, the app, a campaign landing, and a Telegram bot. We built them as one SaaS so a trial started in any of those places is the same account.",
      kind: "client",
      client: "Client name",
      sector: "SaaS",
      year: "2026",
      type: "SaaS",
      image: "",
      gallery: [],
      metric: { value: "4", label: "doors into one product" },
      role: "Strategy, design, frontend, backend, android",
      stack: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "FastAPI",
        "PostgreSQL",
        "Kotlin",
        "Telegram Bot API",
      ],
      url: "https://example.com/saas-product",
      task: "The company sold one product and owned four ways in — a marketing site, an app, a landing for ads, and a Telegram bot — that did not share an account. A trial started in ads did not exist in the app. A chat in Telegram was a second inbox. Traffic was fine. The product was four products.",
      approach: [
        {
          label: "One account, four doors",
          body: "A trial is the same record whether it starts on the site, in the app, on a campaign landing, or in Telegram. None of those surfaces is allowed to open a parallel product.",
        },
        {
          label: "The site argues. The app does the job",
          body: "The marketing site and the landing exist to start the trial. The app is where the product runs. Mixing those jobs is how a homepage becomes a dashboard and a dashboard becomes a brochure.",
        },
        {
          label: "Telegram is a door, not a second support pile",
          body: "The bot files the same account the CRM already knows. A chat that cannot see the trial is how the original four-product problem comes back as five.",
        },
      ],
      outcome:
        "Four surfaces, one product: a trial started on any door is the account the app already runs, and Telegram is looking at that account rather than a parallel inbox.",
      outcomeFacts: [
        { value: "4", label: "doors into one product" },
        { value: "1", label: "account every door writes" },
        { value: "9 → 3", label: "marketing pages kept" },
      ],
      children: [
        "saas-marketing-site",
        "saas-product-app",
        "saas-product-landing",
        "saas-product-tgbot",
      ],
      layers: [
        { id: "saas", label: "SaaS" },
        { id: "website", label: "Website", slug: "saas-marketing-site" },
        { id: "app", label: "App", slug: "saas-product-app" },
        { id: "landing", label: "Landing", slug: "saas-product-landing" },
        { id: "tgbot", label: "Tgbot", slug: "saas-product-tgbot" },
      ],
    },
  ],
  items: [
    {
      slug: "velocult-site",
      family: "velocult",
      short: "Site",
      title: "Split buy, rent, service, and parts onto their own pages and forms",
      kind: "client",
      client: "VeloCult",
      sector: "Logistics",
      year: "2026",
      type: "Website",
      image: "",
      gallery: [],
      summary:
        "Rebuilt the public site so buy, rent, service, shop, and parts each submit from the page that creates the intent. Two catalogs, a find-us page, one origin. The site is the public door into the product.",
      metric: { value: "5", label: "lead types on one origin" },
      role: "Strategy, design, frontend, backend",
      stack: ["React", "Vite", "Tailwind CSS", "FastAPI", "Wouter"],
      url: "https://вело-культ.рф",
      task: "One form treated buy, rent, service, and parts as the same job. Visitors arrived with a task and had no page that matched it. Bikes sat next to bottle cages, and find-us shared a control with book-a-slot. A brochure plus a phone number cannot run a shop that sells, rents, and services e-bikes.",
      approach: [
        {
          label: "A form per intent, not one inbox",
          body: "Buy, rent, service, shop checkout, and parts request each post from the surface where the decision happens. The contact block is not the dump for every job.",
        },
        {
          label: "Two catalogs, distinct pages",
          body: "E-bikes live at /bikes. Accessories live at /shop. Find us is /location. Booking is a form. Roadside and events get their own pages so one nav item is not three jobs.",
        },
        {
          label: "One origin for the whole public site",
          body: "Pages and forms share вело-культ.рф. A visitor does not leave the site to submit a lead, and the storefront does not split across hosts.",
        },
      ],
      outcome:
        "Five distinct leads now leave from the page they were decided on, on one public origin, instead of sharing a generic contact dump.",
      outcomeFacts: [
        { value: "5", label: "lead types on one origin" },
        { value: "7", label: "public storefront routes" },
        { value: "2", label: "separate catalogs" },
      ],
    },
    {
      slug: "velocult-catalog",
      family: "velocult",
      short: "Catalog",
      title: "Split e-bikes and accessories so a frame is never next to a bottle cage",
      kind: "client",
      client: "VeloCult",
      sector: "E-commerce",
      year: "2026",
      type: "Website",
      image: "",
      gallery: [],
      summary:
        "Two catalogs with one job each: e-bikes at /bikes, accessories at /shop, instead of one list that mixed a purchase with a spare part.",
      metric: { value: "2", label: "separate catalogs" },
      role: "Design, frontend, backend",
      stack: ["React", "Vite", "Tailwind CSS", "FastAPI", "PostgreSQL"],
      url: "https://вело-культ.рф",
      task: "E-bikes and accessories lived in one list. A buyer comparing a frame to a bottle cage is not browsing; they are lost. The shop needed two catalogs because those are two different decisions, not two filters on the same page.",
      approach: [
        {
          label: "Two catalogs for two jobs",
          body: "E-bikes live at /bikes. Accessories live at /shop. Mixing them made a buyer compare a frame to a bottle cage. Split the catalogs so each list has one job.",
        },
        {
          label: "A product page that sells one thing",
          body: "Each item opens a page built for that decision — a bike to ride or a part to fit — not a generic card that pretends every SKU is the same kind of purchase.",
        },
        {
          label: "The list is not the homepage",
          body: "The catalogs are routes with a job, not a gallery dumped under the hero. A visitor who came to browse parts does not have to reconstruct the shop from the landing page.",
        },
      ],
      outcome:
        "Two catalogs, two jobs: a bike buyer and a parts buyer each land on a list that only contains what they came for.",
      outcomeFacts: [
        { value: "2", label: "separate catalogs" },
        { value: "/bikes", label: "e-bike catalog" },
        { value: "/shop", label: "accessories catalog" },
      ],
    },
    {
      slug: "velocult-crm",
      family: "velocult",
      short: "CRM",
      title: "Put each job on its own floor queue instead of one inbox",
      kind: "client",
      client: "VeloCult",
      sector: "Logistics",
      year: "2026",
      type: "Automation",
      image: "",
      gallery: [],
      summary:
        "Gave the floor separate queues for buy, rent, repair, and shop. The site form already names the job. Shop tickets move on a status line with signed history, not a chat dump.",
      metric: { value: "4", label: "floor queues by job type" },
      role: "Product, backend, admin",
      stack: ["FastAPI", "SQLAlchemy", "SQLite", "React"],
      url: "https://вело-культ.рф",
      task: "One inbox landed every named job on the same pile. The form on the site already said buy, rent, repair, or shop. Staff still re-sorted the floor in chat or a table, and status lived in the thread. A shop that rents to couriers around the clock cannot run the workshop from a shared dump.",
      approach: [
        {
          label: "A queue per job type",
          body: "Buy, rent, repair, and shop each land in their own list. The floor does not parse one inbox to find out what the ticket is.",
        },
        {
          label: "Status on the ticket, not in the thread",
          body: "Shop work moves on a pipeline: new, called, ready, issued, closed. Cart and part-search have their own steps. The state is on the ticket.",
        },
        {
          label: "Who acted stays on the ticket",
          body: "Each advance, reject, close, and comment is signed by the staff user. The floor reads the ticket, not a side chat, to see who moved it.",
        },
      ],
      outcome:
        "The floor works from typed queues. Shop jobs carry a status and a signed history instead of living in one mixed inbox.",
      outcomeFacts: [
        { value: "4", label: "floor queues by job type" },
        { value: "2", label: "shop status pipelines" },
        { value: "1", label: "signed history per ticket" },
      ],
    },
    {
      slug: "velocult-android",
      family: "velocult",
      short: "App",
      title: "Put rent and service on the floor, not in a browser tab",
      kind: "client",
      client: "VeloCult",
      sector: "E-commerce",
      year: "2026",
      type: "App",
      image: "",
      gallery: [],
      summary:
        "A native Android app for the jobs that happen in the shop — rent and service — talking to the same CRM, not a second inbox on a phone.",
      metric: { value: "1", label: "native client on the floor" },
      role: "Design, android",
      stack: ["Kotlin", "Jetpack Compose", "FastAPI", "PostgreSQL"],
      url: "https://вело-культ.рф",
      task: "Rent and workshop work happen on the floor, not at a desk browser. Opening the public site on a phone is still a brochure: the wrong chrome, the wrong forms, and a second place for the same leads to hide.",
      approach: [
        {
          label: "Native, not a wrap of the site",
          body: "The app is Kotlin on the device, not a WebView of the storefront. Floor work needs the platform, not a squeezed marketing page.",
        },
        {
          label: "The jobs that happen in the shop",
          body: "Rent and service are the screens. The brochure, the bike catalog, and the contact block stay on the public site, where a visitor actually needs them.",
        },
        {
          label: "The same leads as the CRM",
          body: "What the app files is the same ticket the CRM already knows. A phone that starts a second inbox is how the original problem comes back.",
        },
      ],
      outcome:
        "Floor staff file rent and service on the device they are holding, into the same queues the CRM already runs — not into a parallel inbox.",
      outcomeFacts: [
        { value: "1", label: "native client on the floor" },
        { value: "2", label: "floor jobs in the app" },
        { value: "0", label: "second inbox on the phone" },
      ],
    },
    {
      slug: "saas-marketing-site",
      family: "saas-product",
      short: "Website",
      title: "Rebuilt a SaaS marketing site around one job",
      kind: "client",
      client: "Client name",
      sector: "SaaS",
      year: "2026",
      type: "Website",
      image: "/work/saas-marketing-site.png",
      gallery: [],
      summary:
        "Nine landing pages cut down to three, the hero rewritten around the buyer's actual trigger, and signup moved above the fold.",
      metric: { value: "+142%", label: "trial starts" },
      role: "Strategy, design, build",
      stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
      /* Placeholder — replace with the live site. */
      url: "https://example.com/saas-marketing-site",
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
        { value: "+142%", label: "trial starts" },
        { value: "6 wks", label: "to measurable change" },
        { value: "9 → 3", label: "landing pages" },
      ],
    },
    {
      slug: "saas-product-app",
      family: "saas-product",
      short: "App",
      title: "Put the product in an app that is not a squeezed marketing site",
      kind: "client",
      client: "Client name",
      sector: "SaaS",
      year: "2026",
      type: "App",
      image: "",
      gallery: [],
      summary:
        "The logged-in product lives in the app. The marketing site argues; the app does the job — same account a trial already opened on any other door.",
      metric: { value: "1", label: "account the app already knows" },
      role: "Design, android, backend",
      stack: ["Kotlin", "Jetpack Compose", "FastAPI", "PostgreSQL"],
      url: "https://example.com/saas-product",
      task: "The 'app' was a WebView of the marketing site. Logged-in work happened in the same chrome as the brochure, so a trial that started on a landing page had nowhere product-shaped to land, and a phone was a second place for the same account to hide.",
      approach: [
        {
          label: "Native for the job, not a wrap of the site",
          body: "The app is the product on the device. A squeezed homepage is still a homepage, and it is the wrong chrome for someone who already signed up.",
        },
        {
          label: "The account already exists",
          body: "A trial started on the site, a landing, or Telegram opens here as the same user. The app does not create a parallel login because the other doors looked different.",
        },
        {
          label: "Brochure stays on the site",
          body: "Pricing, the argument, and the campaign landing stay public. The app does not grow a second marketing site inside a tab bar.",
        },
      ],
      outcome:
        "The product runs in the app, on the account every other door already wrote — not in a WebView of the page that was supposed to sell it.",
      outcomeFacts: [
        { value: "1", label: "account the app already knows" },
        { value: "0", label: "second login on the phone" },
        { value: "1", label: "job the app is for" },
      ],
    },
    {
      slug: "saas-product-landing",
      family: "saas-product",
      short: "Landing",
      title: "Give paid traffic one page that starts the same trial the site already runs",
      kind: "client",
      client: "Client name",
      sector: "SaaS",
      year: "2026",
      type: "Website",
      image: "",
      gallery: [],
      summary:
        "A campaign landing with one job: start a trial into the existing product. It is not a fifth marketing site, and the account it opens is the one the app already knows.",
      metric: { value: "1", label: "job the landing is for" },
      role: "Strategy, design, build",
      stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
      url: "https://example.com/saas-product",
      task: "Each campaign grew its own landing that argued a different product and dumped signups into a spreadsheet. Paid traffic was buying a parallel trial, not the one the app and the site already shared.",
      approach: [
        {
          label: "One page, one decision",
          body: "The landing names the trigger the ad already used and offers the trial. It does not grow a second sitemap, a second pricing table, or a second blog.",
        },
        {
          label: "Signup is the same trial",
          body: "The form writes the account the SaaS already runs. A campaign that cannot see the product is just another inbox with nicer type.",
        },
        {
          label: "The rest of the argument stays on the site",
          body: "Deep pages, comparisons, and the long case live on the marketing site. The landing is a door, not a duplicate of the company.",
        },
      ],
      outcome:
        "Paid traffic starts the same trial the marketing site already sells, on one page whose only job is that start — not a fifth product with its own backlog.",
      outcomeFacts: [
        { value: "1", label: "job the landing is for" },
        { value: "1", label: "trial every campaign writes" },
        { value: "0", label: "spreadsheet of parallel signups" },
      ],
    },
    {
      slug: "saas-product-tgbot",
      family: "saas-product",
      short: "Tgbot",
      title: "Put Telegram on the same account, not on a second support pile",
      kind: "client",
      client: "Client name",
      sector: "SaaS",
      year: "2026",
      type: "Automation",
      image: "",
      gallery: [],
      summary:
        "A Telegram bot that can start or continue the same trial the site, the landing, and the app already share — not a chat that becomes a fifth inbox.",
      metric: { value: "1", label: "account the bot can see" },
      role: "Strategy, backend",
      stack: ["FastAPI", "PostgreSQL", "Telegram Bot API"],
      url: "https://example.com/saas-product",
      task: "Customers already lived in Telegram. The bot answered as a stranger: it could not see the trial, could not open one, and every chat became a ticket that did not exist in the product. Support was a second company with a worse memory.",
      approach: [
        {
          label: "The bot is a door",
          body: "Start a trial, pick up an existing one, or ask a status the product already knows. A bot that only chats is a helpdesk with extra steps.",
        },
        {
          label: "Same account as the app",
          body: "Identity in Telegram maps to the SaaS user. A message that cannot see the trial is how the four-door product becomes five inboxes.",
        },
        {
          label: "No parallel queue",
          body: "What the bot files is visible in the same place the site and the app already write. Support does not keep a Telegram-only pile.",
        },
      ],
      outcome:
        "Telegram is looking at the same account the rest of the product runs — a door, not a second company that happens to share a logo.",
      outcomeFacts: [
        { value: "1", label: "account the bot can see" },
        { value: "0", label: "Telegram-only ticket pile" },
        { value: "3", label: "jobs the bot can start" },
      ],
    },
    {
      slug: "storefront-performance",
      family: "",
      short: "",
      title: "Took a storefront from four seconds to one",
      kind: "self",
      client: "",
      sector: "E-commerce",
      year: "2025",
      type: "Growth",
      image: "/work/storefront-performance.png",
      gallery: [],
      summary:
        "A plugin-heavy theme replaced with a custom build: 80% of the JavaScript gone and the product page rebuilt from scratch.",
      metric: { value: "1.1s", label: "largest contentful paint" },
      role: "Design, build",
      stack: ["Next.js", "TypeScript", "PostgreSQL", "Vercel"],
      /* Placeholder — replace with the live site. */
      url: "https://example.com/storefront-performance",
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
        { value: "1.1s", label: "largest contentful paint" },
        { value: "−80%", label: "JavaScript shipped" },
        { value: "4s → 1.1s", label: "load on mid-range mobile" },
      ],
    },
    {
      slug: "arrivalio",
      family: "",
      short: "",
      title: "Turned a fragmented move to BC into 48 sequenced tasks",
      kind: "self",
      client: "Arrivalio",
      sector: "Immigration",
      year: "2026",
      type: "Web App",
      image: "/work/arrivalio/card_image.png",
      gallery: [
        "/work/arrivalio/Screenshot_desctop_1.jpeg",
        "/work/arrivalio/Screenshot_desctop_2.jpeg",
        "/work/arrivalio/screenshots_mobile_1.jpeg",
        "/work/arrivalio/screenshots_mobile_2.jpeg",
      ],
      summary:
        "A dependency-aware task system that sequences 48 settlement tasks by stage and legal age, built solo, no account required, in six languages.",
      metric: { value: "48", label: "settlement tasks, sequenced" },
      role: "UX research, design, build",
      stack: [
        "React",
        "TypeScript",
        "Vite",
        "Tailwind",
        "Firebase",
        "i18next",
        "Vercel",
      ],
      url: "https://arrivalio.online",
      task: "Newcomers arriving in British Columbia face critical first steps — SIN registration, health coverage, banking, housing — scattered across dozens of government sites, with no sequence, no awareness of age-based legal restrictions, and no guard against the scams that specifically target new arrivals.",
      approach: [
        {
          label: "A dependency-aware task system",
          body: "48 tasks map to a stage — Pre-Arrival through Month 3 — a priority tier, and a set of dependencies. A locked task stays visible but inactive until its prerequisites clear, so the sequence does the explaining instead of a wall of information.",
        },
        {
          label: "Content that knows the user's age",
          body: "BC sets its age of majority at 19, a year later than most provinces. An override system adapts task guidance below that line — a user under 19 is told they can't sign a phone contract and pointed to a prepaid plan instead, built into onboarding rather than bolted on after.",
        },
        {
          label: "No account required",
          body: "Onboarding through task completion works as a guest. A dedicated design system — color, type, spacing, component states — lives in its own style-guide screen and holds 48 content pages and six languages to one visual standard.",
        },
      ],
      outcome:
        "Solo-designed and built, live in production, and currently under review by Kwantlen Polytechnic University for inclusion in its international student resources. Design process included user journey mapping and full UI design in Figma before any code.",
      outcomeFacts: [
        { value: "48", label: "personalized tasks" },
        { value: "6", label: "languages supported" },
        { value: "Solo", label: "design + build" },
      ],
    },
  ],
};

/**
 * The studio's working set, grouped the way a client would ask "what do you
 * actually build with". Names match the tools, not a vendor's marketing line
 * (Vue.js not Vue; Jetpack Compose not Compose).
 */
export const stack = {
  headline: "We build on tools your team can keep",
  sub: "No proprietary page builder you can't leave. Everything ships as code you own, on infrastructure you control.",
  groups: [
    {
      title: "Frontend",
      items: [
        "React",
        "TypeScript",
        "Next.js",
        "Vite",
        "Vue.js",
        "Tailwind",
        "GSAP",
      ],
    },
    {
      title: "Backend",
      items: ["Java", "Scala", "Kotlin", "Python", "JavaScript"],
    },
    {
      title: "Data & storage",
      items: ["PostgreSQL", "SQL", "Redis", "Firebase"],
    },
    {
      title: "Ship & run",
      items: ["Vercel", "Docker", "Git", "Kubernetes", "Linux"],
    },
    {
      title: "Android",
      items: ["Android Views", "Jetpack Compose"],
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
  pager: {
    prev: "Previous service",
    next: "Next service",
  },
  items: [
    {
      slug: "website-design",
      title: "Web Design & Development",
      body: "From concept to launch.",
      intro:
        "Custom websites designed around your business, built for performance, clarity, and conversion.",
      included: [
        {
          label: "Concept & structure",
          body: "The argument the site has to make, and the pages that make it, before any visual pass.",
        },
        {
          label: "Custom design",
          body: "Designed around this business, not a template with the logo swapped.",
        },
        {
          label: "Production build",
          body: "Shipped as production code — fast, clear, and yours to keep.",
        },
        {
          label: "Built to convert",
          body: "The screens that carry the decision get the attention, not a gallery of unused states.",
        },
      ],
    },
    {
      slug: "redesign",
      title: "Website Redesign",
      body: "Make your existing site work harder.",
      intro:
        "We rethink structure, UX, design, and performance while preserving what already works.",
      included: [
        {
          label: "What already works",
          body: "An audit of the pages, flows, and rankings worth keeping, before anything is taken apart.",
        },
        {
          label: "Structure & UX",
          body: "Information architecture and flows rebuilt around the decision a visitor is actually making.",
        },
        {
          label: "Design & performance",
          body: "A new visual system and a faster front end, not a repaint on the same slow stack.",
        },
        {
          label: "Migration without loss",
          body: "Redirects and a staged cutover, so what already ranks and converts is not thrown out with the rest.",
        },
      ],
    },
    {
      slug: "digital-products",
      title: "Digital Products",
      body: "From idea to working product.",
      intro:
        "Web apps, dashboards, portals, and custom digital experiences designed and built around your users.",
      included: [
        {
          label: "The job first",
          body: "We start with the job the product has to do for a real user, not a feature list.",
        },
        {
          label: "Apps, dashboards, portals",
          body: "Designed as products people work in, not as dressed-up admin screens.",
        },
        {
          label: "Around your users",
          body: "Flows and interface follow how people actually use it, not how the schema is shaped.",
        },
        {
          label: "Working software",
          body: "What we hand over runs — owned code, on infrastructure you control.",
        },
      ],
    },
    {
      slug: "android-development",
      title: "Android development",
      body: "Not just an app, but a complete product. Native development, interface, performance, and functionality working seamlessly across all devices.",
      intro:
        "An APK is not a product. We build the native Android app as the thing people actually use — the interface, the performance on the phones they own, and the features that have to work the same way on a cheap handset and a flagship, not a demo that only holds on the device it was designed on.",
      included: [
        {
          label: "Native build",
          body: "Native Kotlin development, not a wrap of a website, so the app behaves like it belongs on Android.",
        },
        {
          label: "Interface",
          body: "Interface designed for thumbs and varied screen sizes, not a desktop layout squeezed down.",
        },
        {
          label: "Performance",
          body: "Performance work so launch, scroll, and the paths people hit every day stay fast on real devices.",
        },
        {
          label: "Device coverage",
          body: "Functionality checked across the device range your users actually have, not a single studio phone.",
        },
      ],
    },
    {
      slug: "care-growth",
      title: "Care & Growth",
      body: "Your website doesn't stop at launch.",
      intro:
        "Ongoing design, development, optimization, and improvements through a monthly partnership.",
      included: [
        {
          label: "Monthly partnership",
          body: "A block of design and development hours, scoped before the month starts.",
        },
        {
          label: "Optimization",
          body: "Performance, conversion, and the small tests that a one-off launch never gets to.",
        },
        {
          label: "Improvements that ship",
          body: "New pages, fixes, and iteration on an agreed cadence — not a queue that quietly slips.",
        },
        {
          label: "A log of what moved",
          body: "A running record of what shipped, so the retainer stays accountable to itself.",
        },
      ],
    },
    {
      slug: "digital-solutions",
      title: "Digital Solutions",
      body: "Connect the pieces. Automate the work.",
      intro:
        "Custom integrations, APIs, automation, and digital tools that make your business run better.",
      included: [
        {
          label: "Integrations",
          body: "The tools your team already uses — CRM, billing, support — talking to each other instead of through a spreadsheet.",
        },
        {
          label: "APIs",
          body: "Interfaces between systems you own, so the next tool can plug in without a rebuild.",
        },
        {
          label: "Automation",
          body: "The Tuesday-morning work that should not depend on someone remembering to do it.",
        },
        {
          label: "Digital tools",
          body: "Small internal products for the jobs a SaaS package almost covers, built on infrastructure you can keep.",
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
   *
   * Photos live in `frontend/public/about/` and are served as `/about/<file>`.
   * Two cards for now — a third "the two of us" shot waits until there is one.
   */
  founders: {
    eyebrow: "The two of us",
    headline: "Who you actually get",
    body: "Two senior people, both hands-on. Vlad leads design and front-end, Vanya leads back-end and infrastructure — and on a project this size that split is a conversation, not a handoff. You talk to both of us, for the whole engagement.",
    cards: [
      {
        name: "Vlad",
        role: "Design and front-end",
        mark: "design" as const,
        photo: "/about/vlad.jpg",
      },
      {
        name: "Vanya",
        role: "Back-end",
        mark: "code" as const,
        photo: "/about/vanya.jpg",
        /* Landscape shot, person on the left. Cover-crop on a tall card
           would otherwise take the empty mountain on the right. */
        photoPosition: "22% 40%",
      },
    ],
  },
  cta: { label: "Start a project", href: "/#contact" },
};

export const legal = {
  updated: "26 August 2026",
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
        body: "Questions about these terms can go to contact@twinvstudio.com.",
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
        body: "The brief form asks for your name, email, phone number, what you need, how you heard about the studio, optionally your current site's URL, and a budget range unless you asked for a demo. That's the whole set — see the form itself for the exact fields. We don't collect anything passively: no cookies, no analytics pixels, no third-party scripts on this site.",
      },
      {
        title: "How we use it",
        body: "To read your brief and reply by email or phone. Nothing is added to a marketing list, and nothing is sold or shared with a third party.",
      },
      {
        title: "How long we keep it",
        body: "Brief submissions are kept as long as they're useful to the conversation they started — typically the length of an active discussion or engagement — and deleted when they're not.",
      },
      {
        title: "Your rights",
        body: "You can ask what we hold about you, ask us to correct it, or ask us to delete it, at any time, by writing to contact@twinvstudio.com.",
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
 * renaming one is a backend-visible change, while `label` and `prompt` are
 * free text. `prompt` is the message field: its title and placeholder swap
 * with the selected goal so the form asks the right question, not a generic
 * "what is not working" on a new-site brief. Budget, source, and phone ids
 * live on the same contract.
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
    {
      id: "new-site",
      label: "New site",
      prompt: {
        label: "What should the new site do?",
        placeholder:
          "Who it's for, what it should achieve, and what you already have — even if that's nothing.",
      },
    },
    {
      id: "redesign",
      label: "Redesign",
      prompt: {
        label: "What is not working?",
        placeholder:
          "The number you want to move, and what you think is in the way.",
      },
    },
    {
      id: "audit",
      label: "Audit",
      prompt: {
        label: "What should we look at?",
        placeholder:
          "The pages or funnel that worry you, and what you'd need to see to act.",
      },
    },
    {
      id: "demo",
      label: "Demo",
      prompt: {
        label: "What do you want to walk through?",
        placeholder: "A similar build, how we work, or a specific question.",
      },
    },
  ],
  fields: {
    site: {
      label: "Current site",
      hint: "Optional",
      placeholder: "yourstudio.com",
    },
    name: { label: "Name", placeholder: "" },
    email: { label: "Email", placeholder: "" },
    phone: {
      label: "Phone",
      placeholder: "+1 415 555 0100",
    },
    budget: {
      label: "Budget range",
      placeholder: "Select a range",
      /* Demo has no dropdown — a walkthrough is $0, so asking for a range
         would be a lie. The other three goals don't share a scale: a site
         and a redesign sit in the same thousands, an audit does not. */
      byGoal: {
        "new-site": [
          { id: "under-700", label: "Under $700" },
          { id: "700-1k", label: "$700\u2013$1,000" },
          { id: "1k-1.5k", label: "$1,000\u2013$1,500" },
          { id: "1.5k-2.5k", label: "$1,500\u2013$2,500" },
          { id: "2.5k-4k", label: "$2,500\u2013$4,000" },
          { id: "4k-6k", label: "$4,000\u2013$6,000" },
          { id: "6k-plus", label: "$6,000+" },
        ],
        redesign: [
          { id: "under-1k", label: "Under $1,000" },
          { id: "1k-1.5k", label: "$1,000\u2013$1,500" },
          { id: "1.5k-2.5k", label: "$1,500\u2013$2,500" },
          { id: "2.5k-4k", label: "$2,500\u2013$4,000" },
          { id: "4k-6k", label: "$4,000\u2013$6,000" },
          { id: "6k-plus", label: "$6,000+" },
        ],
        audit: [
          { id: "audit-free", label: "Free (mini audit)" },
          { id: "300-500", label: "$300\u2013$500" },
          { id: "500-1k", label: "$500\u2013$1,000" },
          { id: "1k-2k", label: "$1,000\u2013$2,000" },
          { id: "2k-plus", label: "$2,000+" },
        ],
      },
    },
    source: {
      label: "How did you hear about us?",
      placeholder: "Select one",
      options: [
        { id: "friend", label: "A friend or colleague" },
        { id: "instagram", label: "Instagram" },
        { id: "google", label: "Google" },
        { id: "linkedin", label: "LinkedIn" },
        { id: "other", label: "Somewhere else" },
      ],
      other: {
        label: "Where was that?",
        placeholder: "A directory, a talk, a newsletter",
      },
    },
  },
  errors: {
    goal: "Pick one so we know where to start.",
    message: "A sentence or two is plenty.",
    name: "We would rather not open with \u201cHi there\u201d.",
    email: "We need somewhere to reply.",
    emailFormat: "That address is missing something.",
    phone: "Add a number we can call.",
    phoneFormat: "That number needs a few more digits.",
    budget: "Pick the range that is closest.",
    source: "Pick one \u2014 it helps us know what is working.",
    sourceOther: "A few words on where you found us.",
    submit: "That did not send. Try again, or email contact@twinvstudio.com.",
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
  email: "contact@twinvstudio.com",
  blurb:
    "A web design and development studio building sites that carry their weight.",
  /** Same action as `work.close.cta`, under the email so it is on every page. */
  cta: work.close.cta,
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
        { label: "Work", href: "/work" },
        { label: "Services", href: "/services/website-design" },
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
