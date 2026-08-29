import { work } from "./content";

export type WorkCase = (typeof work.items)[number];
export type WorkFamily = (typeof work.families)[number];

/** Fields a tile (index or hub grid) actually paints. */
export type WorkTileItem = {
  slug: string;
  title: string;
  kind: WorkCase["kind"];
  client: string;
  sector: string;
  year: string;
  type: string;
  image: string;
  summary: string;
};

export type WorkLayer = {
  id: string;
  label: string;
  project: WorkCase;
};

/** High-level engagement case: lives on the family hub, not as a child slug. */
export function overviewCase(family: WorkFamily): WorkCase {
  return {
    slug: family.slug,
    family: family.slug,
    short: family.layers?.[0]?.label || family.type || "SaaS",
    title: family.title,
    kind: family.kind,
    client: family.client,
    sector: family.sector,
    year: family.year,
    type: family.type || "Website",
    image: family.image,
    gallery: family.gallery,
    summary: family.summary,
    metric: family.metric,
    role: family.role,
    stack: family.stack,
    url: family.url,
    task: family.task,
    approach: family.approach,
    outcome: family.outcome,
    outcomeFacts: family.outcomeFacts,
  };
}

export function findFamily(slug: string) {
  return work.families.find((family) => family.slug === slug);
}

export function findCase(slug: string) {
  return work.items.find((item) => item.slug === slug);
}

export function teaserItems(): WorkCase[] {
  return work.teaser
    .map((slug) => {
      const family = findFamily(slug);
      if (family) return overviewCase(family);
      return findCase(slug);
    })
    .filter((item): item is WorkCase => Boolean(item));
}

export function familyOf(item: WorkCase) {
  return item.family ? findFamily(item.family) : undefined;
}

export function familyCases(family: WorkFamily): WorkCase[] {
  return family.children
    .map((slug) => findCase(slug))
    .filter((item): item is WorkCase => Boolean(item));
}

/**
 * Hub tags: the first layer with no `slug` is the high-level engagement.
 * The rest point at child cases.
 */
export function familyLayers(family: WorkFamily): WorkLayer[] {
  if (family.layers?.length) {
    return family.layers
      .map((layer) => {
        const project = layer.slug
          ? findCase(layer.slug)
          : overviewCase(family);
        if (!project) return null;
        return { id: layer.id, label: layer.label, project };
      })
      .filter((layer): layer is WorkLayer => Boolean(layer));
  }

  return familyCases(family).map((item) => ({
    id: item.short || item.slug,
    label: item.short || item.type,
    project: item,
  }));
}

export function layerIdFor(item: WorkCase, family: WorkFamily): string | undefined {
  const match = familyLayers(family).find(
    (layer) => layer.project.slug === item.slug,
  );
  return match?.id;
}

export function siblingPager(item: WorkCase) {
  const family = familyOf(item);
  if (!family) return null;
  const siblings = familyCases(family);
  if (siblings.length < 2) return null;
  const index = siblings.findIndex((sibling) => sibling.slug === item.slug);
  const count = siblings.length;
  return {
    prev: siblings[(index - 1 + count) % count],
    next: siblings[(index + 1) % count],
  };
}

function tileFromCase(item: WorkCase): WorkTileItem {
  return {
    slug: item.slug,
    title: item.title,
    kind: item.kind,
    client: item.client,
    sector: item.sector,
    year: item.year,
    type: item.type,
    image: item.image,
    summary: item.summary,
  };
}

function tileFromFamily(family: WorkFamily): WorkTileItem {
  const overview = overviewCase(family);
  return tileFromCase(overview);
}

/**
 * All work: the engagement hub, then cases that are not a family child.
 * Surfaces are reached from the hub tags, not as a second row of tiles.
 */
export function indexTiles(): WorkTileItem[] {
  const nested = new Set(
    work.families.flatMap((family) => family.children),
  );
  const tiles: WorkTileItem[] = work.families.map(tileFromFamily);

  for (const item of work.items) {
    if (!nested.has(item.slug)) tiles.push(tileFromCase(item));
  }

  return tiles;
}

export function allWorkSlugs(): { slug: string }[] {
  return [
    ...work.families.map((family) => ({ slug: family.slug })),
    ...work.items.map((item) => ({ slug: item.slug })),
  ];
}
