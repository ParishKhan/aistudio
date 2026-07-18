import type { CollectionEntry } from 'astro:content';

export interface Source {
  url: string;
  verified: Date;
  note?: string;
}

/**
 * Numbered source list for a model page. Cites are collected in a stable
 * order and deduped by URL; `indexOf(url)` gives the superscript number used
 * by SourceNote and the page-footer source list.
 */
export function modelSources(model: CollectionEntry<'models'>) {
  const d = model.data;
  const cites = [
    d.releaseDate.cite,
    d.knowledgeCutoff?.cite,
    d.contextWindow.cite,
    d.maxOutput?.cite,
    d.pricing.cite,
    d.api.cite,
    ...d.benchmarks.map((b) => b.cite),
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  const list: Source[] = [];
  const index = new Map<string, number>();
  for (const cite of cites) {
    if (!index.has(cite.url)) {
      list.push({ url: cite.url, verified: cite.verified, note: cite.note });
      index.set(cite.url, list.length);
    }
  }
  return {
    list,
    indexOf: (url: string) => index.get(url) ?? 0,
  };
}

/** Earliest `verified` date across a model's cites; shown as "verified" on the page. */
export function oldestVerified(model: CollectionEntry<'models'>): Date {
  const { list } = modelSources(model);
  return list.reduce(
    (min, s) => (s.verified < min ? s.verified : min),
    model.data.lastVerified,
  );
}
