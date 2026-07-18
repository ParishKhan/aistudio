export const SITE = {
  name: 'AIStudio',
  url: 'https://aistudio.quest',
  tagline: 'The AI product reference database',
  description:
    'Specs, pricing, context windows, and benchmarks for every major AI model and coding app. Compare GPT, Claude, Gemini, Grok, Mistral, and DeepSeek side by side — every fact sourced and dated.',
  github: 'https://github.com/ParishKhan/aistudio',
} as const;

export interface Section {
  slug: string;
  title: string;
  /** Shown on the section index and in nav tooltips/footer. */
  blurb: string;
  group: 'database' | 'library' | 'learn';
}

/** The 16 top-level sections. Slugs are reserved words for the flat-URL check. */
export const SECTIONS: Section[] = [
  { slug: 'models', title: 'Models', blurb: 'Every major AI model: specs, pricing, benchmarks', group: 'database' },
  { slug: 'apps', title: 'Apps', blurb: 'AI coding apps and app builders, compared', group: 'database' },
  { slug: 'comparisons', title: 'Comparisons', blurb: 'Side-by-side model matchups', group: 'database' },
  { slug: 'benchmarks', title: 'Benchmarks', blurb: 'What each benchmark measures, and who leads it', group: 'database' },
  { slug: 'pricing', title: 'Pricing', blurb: 'API pricing for every model, one table', group: 'database' },
  { slug: 'context-windows', title: 'Context Windows', blurb: 'Context and output limits for every model', group: 'database' },
  { slug: 'calculators', title: 'Calculators', blurb: 'Token cost and usage calculators', group: 'database' },
  { slug: 'api-explorer', title: 'API Explorer', blurb: 'Model IDs, endpoints, and code snippets', group: 'database' },
  { slug: 'prompts', title: 'Prompt Library', blurb: 'Tested prompts for real tasks', group: 'library' },
  { slug: 'tools', title: 'Tool Directory', blurb: 'AI developer tools, catalogued', group: 'library' },
  { slug: 'agents', title: 'Agents', blurb: 'Agent frameworks and products', group: 'library' },
  { slug: 'templates', title: 'Templates', blurb: 'Starter templates for AI apps', group: 'library' },
  { slug: 'workflows', title: 'Workflows', blurb: 'End-to-end AI workflow recipes', group: 'library' },
  { slug: 'news', title: 'News', blurb: 'Model releases and pricing changes', group: 'learn' },
  { slug: 'tutorials', title: 'Tutorials', blurb: 'Practical guides for building with AI', group: 'learn' },
  { slug: 'about', title: 'About', blurb: 'What AIStudio is and how we verify data', group: 'learn' },
];

/** Primary top-bar navigation (the rest live in the footer + section indexes). */
export const NAV_PRIMARY = ['models', 'apps', 'comparisons', 'benchmarks', 'pricing', 'calculators'].map(
  (slug) => SECTIONS.find((s) => s.slug === slug)!,
);

/**
 * Reserved root slugs: no generated flat page (model, sub-page, comparison)
 * may collide with these. Enforced by scripts/check-data.ts.
 */
export const RESERVED_SLUGS = [
  ...SECTIONS.map((s) => s.slug),
  'search',
  'methodology',
  'styleguide',
  'og',
  'rss',
  'sitemap-index',
  '404',
];
