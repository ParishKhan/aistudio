import type { CollectionEntry } from 'astro:content';
import { tokens, usd } from './fmt';

/**
 * Title/description builders for every programmatic page type. Titles stay
 * ≤60 chars where possible; descriptions are unique per page (seeded from the
 * hand-written model description plus type-specific data).
 */

type Model = CollectionEntry<'models'>['data'];

export function modelTitles(m: Model) {
  const ctx = tokens(m.contextWindow.value);
  const price = `${usd(m.pricing.input)}/${usd(m.pricing.output)}`;
  return {
    hub: {
      title: `${m.name}: Specs, Pricing, Context Window & Benchmarks`,
      description: m.description,
    },
    pricing: {
      title: `${m.name} API Pricing (Per 1M Tokens)`,
      description: `${m.name} API pricing: ${price} per 1M input/output tokens, with cached, batch, and real-task cost breakdowns. Verified against official ${m.family} pricing.`,
    },
    api: {
      title: `${m.name} API: Model ID, Providers & Code Examples`,
      description: `How to call ${m.name} via API: model ID ${m.api.modelIds[0]}, provider availability, and copy-paste curl, Python, and TypeScript examples.`,
    },
    'context-window': {
      title: `${m.name} Context Window: ${ctx} Tokens Explained`,
      description: `${m.name} has a ${ctx}-token context window${m.maxOutput ? ` and ${tokens(m.maxOutput.value)} max output` : ''}. What actually fits in it, and how it ranks against other models.`,
    },
    benchmarks: {
      title: `${m.name} Benchmarks: All Scores & Sources`,
      description: `Every published ${m.name} benchmark score — coding, reasoning, and agentic evals — with the original source for each number and how it ranks.`,
    },
    alternatives: {
      title: `${m.name} Alternatives: Cheaper & Comparable Models`,
      description: `The best alternatives to ${m.name} compared on price, context window, and benchmarks — including cheaper options and closest rivals.`,
    },
    prompts: {
      title: `Best Prompts for ${m.name}`,
      description: `Tested prompts and prompting techniques for ${m.name}, from coding to analysis, with notes on what works for this model.`,
    },
  } as const;
}

export function compareTitle(a: Model, b: Model) {
  return {
    title: `${a.name} vs ${b.name}: Full Comparison`,
    description: `${a.name} vs ${b.name} compared: benchmarks, API pricing (${usd(a.pricing.input)} vs ${usd(b.pricing.input)} per 1M input), context windows (${tokens(a.contextWindow.value)} vs ${tokens(b.contextWindow.value)}), and which to pick.`,
  };
}

export type ModelSubpage = keyof ReturnType<typeof modelTitles>;
