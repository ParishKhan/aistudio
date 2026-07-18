import { getCollection, type CollectionEntry } from 'astro:content';
import { SECTIONS, SITE } from '../data/site';
import { modelTitles, compareTitle, type ModelSubpage } from './seo';
import { tokens, usd } from './fmt';
import type { OgSpec } from './og';

export type ModelEntry = CollectionEntry<'models'>;
export type ComparisonEntry = CollectionEntry<'comparisons'>;

export type FlatPage =
  | { slug: string; type: 'model-hub'; model: ModelEntry; title: string; description: string; og: OgSpec }
  | { slug: string; type: `model-${ModelSubpage}`; subpage: ModelSubpage; model: ModelEntry; title: string; description: string; og: OgSpec }
  | { slug: string; type: 'compare'; a: ModelEntry; b: ModelEntry; comparison?: ComparisonEntry; title: string; description: string; og: OgSpec };

const SUBPAGES: ModelSubpage[] = ['pricing', 'api', 'context-window', 'benchmarks', 'alternatives', 'prompts'];

/** Canonical vs-order: lower priority number (more searched) goes first. */
export function orderPair(a: ModelEntry, b: ModelEntry): [ModelEntry, ModelEntry] {
  return a.data.priority <= b.data.priority ? [a, b] : [b, a];
}

function modelStats(m: ModelEntry): { label: string; value: string }[] {
  return [
    { label: 'Context', value: tokens(m.data.contextWindow.value) },
    { label: 'Input / 1M', value: usd(m.data.pricing.input) },
    { label: 'Output / 1M', value: usd(m.data.pricing.output) },
  ];
}

/** Every root-level programmatic page. Single source of truth for [slug].astro and the OG endpoint. */
export async function getFlatPages(): Promise<FlatPage[]> {
  const [models, comparisons, prompts] = await Promise.all([
    getCollection('models'),
    getCollection('comparisons'),
    getCollection('prompts'),
  ]);
  const byId = new Map(models.map((m) => [m.id, m]));
  const pages: FlatPage[] = [];

  for (const model of models) {
    const t = modelTitles(model.data);
    const vendorKicker = `${model.data.family} · ${tokens(model.data.contextWindow.value)} context`;

    pages.push({
      slug: model.data.slug,
      type: 'model-hub',
      model,
      title: t.hub.title,
      description: t.hub.description,
      og: { title: model.data.name, kicker: 'Model specs & pricing', stats: modelStats(model) },
    });

    for (const sub of SUBPAGES) {
      // Skip thin prompt pages: only generate when ≥3 prompts reference the model.
      if (sub === 'prompts') {
        const count = prompts.filter((p) => p.data.models.some((r) => r.id === model.id)).length;
        if (count < 3) continue;
      }
      pages.push({
        slug: `${model.data.slug}-${sub}`,
        type: `model-${sub}`,
        subpage: sub,
        model,
        title: t[sub].title,
        description: t[sub].description,
        og: {
          title: t[sub].title,
          kicker: vendorKicker,
          stats: sub === 'pricing' ? modelStats(model) : undefined,
        },
      });
    }
  }

  for (const comparison of comparisons) {
    const a = byId.get(comparison.data.a.id);
    const b = byId.get(comparison.data.b.id);
    if (!a || !b) continue;
    const [first, second] = orderPair(a, b);
    const t = compareTitle(first.data, second.data);
    pages.push({
      slug: `${first.data.slug}-vs-${second.data.slug}`,
      type: 'compare',
      a: first,
      b: second,
      comparison,
      title: t.title,
      description: t.description,
      og: {
        title: `${first.data.name} vs ${second.data.name}`,
        kicker: 'Head-to-head comparison',
        stats: [
          { label: 'Input / 1M', value: `${usd(first.data.pricing.input)} · ${usd(second.data.pricing.input)}` },
          { label: 'Context', value: `${tokens(first.data.contextWindow.value)} · ${tokens(second.data.contextWindow.value)}` },
        ],
      },
    });
  }

  return pages;
}

/** URL path → OG slug used under /og/. Mirrors the mapping in SEO.astro. */
export function ogSlugForPath(path: string): string {
  const clean = path.replace(/\/$/, '') || '/';
  return clean === '/' ? 'home' : clean.replace(/^\//, '').replaceAll('/', '--');
}

/** All OG images to generate: one per flat page + home + section indexes. */
export async function getOgEntries(): Promise<Map<string, OgSpec>> {
  const entries = new Map<string, OgSpec>();

  entries.set('home', { title: SITE.tagline, stats: [{ label: 'Every fact', value: 'sourced + dated' }] });
  for (const section of SECTIONS) {
    entries.set(ogSlugForPath(`/${section.slug}`), { title: section.title, kicker: 'AIStudio' });
  }
  entries.set('methodology', { title: 'How we verify data', kicker: 'AIStudio' });

  for (const page of await getFlatPages()) {
    entries.set(ogSlugForPath(`/${page.slug}`), page.og);
  }

  return entries;
}
