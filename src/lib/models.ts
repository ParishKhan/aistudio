import type { CollectionEntry } from 'astro:content';
import { tokens, usd, score as fmtScore } from './fmt';
import type { CompareRow } from '../components/data/CompareGrid.astro';

type Model = CollectionEntry<'models'>;
type Benchmark = CollectionEntry<'benchmarks'>;

export const isCurrent = (m: Model) => m.data.status === 'current' || m.data.status === 'preview';

export const byPriority = (a: Model, b: Model) => a.data.priority - b.data.priority;

/** Score a model reports for a benchmark id, or undefined. */
export function scoreFor(m: Model, benchmarkId: string) {
  return m.data.benchmarks.find((b) => b.benchmark.id === benchmarkId);
}

/** Ranked list of models reporting a benchmark, best first. */
export function ranking(models: Model[], benchmark: Benchmark) {
  const rows = models
    .map((m) => ({ model: m, entry: scoreFor(m, benchmark.id) }))
    .filter((r) => r.entry !== undefined)
    .map((r) => ({ model: r.model, entry: r.entry! }));
  rows.sort((a, b) => (benchmark.data.higherIsBetter ? b.entry.score - a.entry.score : a.entry.score - b.entry.score));
  return rows;
}

export interface Alternatives {
  sameTier: Model[];
  cheaper: Model | null;
  biggerContext: Model | null;
  betterCoding: Model | null;
}

/** Computed alternative picks for the -alternatives page. */
export function alternativesFor(model: Model, all: Model[]): Alternatives {
  const others = all.filter((m) => m.id !== model.id && isCurrent(m));
  const sameTier = others.filter((m) => m.data.tier === model.data.tier).sort(byPriority);

  const cheaper =
    others
      .filter((m) => m.data.pricing.input < model.data.pricing.input)
      .sort((a, b) => b.data.pricing.input - a.data.pricing.input)[0] ?? null;

  const biggerContext =
    others
      .filter((m) => m.data.contextWindow.value > model.data.contextWindow.value)
      .sort((a, b) => b.data.contextWindow.value - a.data.contextWindow.value)[0] ?? null;

  const own = scoreFor(model, 'swe-bench-pro');
  const betterCoding =
    others
      .map((m) => ({ m, s: scoreFor(m, 'swe-bench-pro') }))
      .filter((r) => r.s && (!own || r.s.score > own.score))
      .sort((a, b) => b.s!.score - a.s!.score)[0]?.m ?? null;

  return { sameTier, cheaper, biggerContext, betterCoding };
}

/** Spec + pricing + benchmark rows for a head-to-head grid, with win flags. */
export function compareRows(a: Model, b: Model, benchmarks: Benchmark[]): CompareRow[] {
  const rows: CompareRow[] = [];
  const num = (label: string, va: number, vb: number, display: (n: number) => string, lowerWins = false, subs?: [string?, string?]) => {
    const winA = lowerWins ? va < vb : va > vb;
    const winB = lowerWins ? vb < va : vb > va;
    rows.push({
      label,
      cells: [
        { display: display(va), win: winA, sub: subs?.[0] },
        { display: display(vb), win: winB, sub: subs?.[1] },
      ],
    });
  };

  num('Context window', a.data.contextWindow.value, b.data.contextWindow.value, tokens);
  if (a.data.maxOutput && b.data.maxOutput) num('Max output', a.data.maxOutput.value, b.data.maxOutput.value, tokens);
  num('Input price / 1M', a.data.pricing.input, b.data.pricing.input, usd, true);
  num('Output price / 1M', a.data.pricing.output, b.data.pricing.output, usd, true);
  if (a.data.pricing.cachedInput !== undefined && b.data.pricing.cachedInput !== undefined) {
    num('Cached input / 1M', a.data.pricing.cachedInput, b.data.pricing.cachedInput, usd, true);
  }
  rows.push({
    label: 'Knowledge cutoff',
    cells: [
      { display: a.data.knowledgeCutoff?.value ?? '-' },
      { display: b.data.knowledgeCutoff?.value ?? '-' },
    ],
  });
  rows.push({
    label: 'Release date',
    cells: [
      { display: a.data.releaseDate.value.toISOString().slice(0, 10) },
      { display: b.data.releaseDate.value.toISOString().slice(0, 10) },
    ],
  });

  for (const bench of benchmarks) {
    const sa = scoreFor(a, bench.id);
    const sb = scoreFor(b, bench.id);
    if (!sa || !sb) continue;
    num(
      bench.data.name,
      sa.score,
      sb.score,
      (n) => fmtScore(n, bench.data.scoreType),
      !bench.data.higherIsBetter,
      [sa.variant, sb.variant],
    );
  }
  return rows;
}
