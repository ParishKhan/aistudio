import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/*
 * Every load-bearing fact carries a citation: the official source URL and the
 * date we last checked it. check-data.ts flags anything older than 90 days.
 */
const isoDate = z.coerce.date();

const cite = z.object({
  url: z.string().url(),
  verified: isoDate,
  note: z.string().optional(),
});

const cited = <T extends z.ZodTypeAny>(value: T) => z.object({ value, cite });

const faq = z.array(z.object({ q: z.string(), a: z.string() })).default([]);

/** USD per 1M tokens. */
const price = z.object({
  input: z.number(),
  output: z.number(),
  cachedInput: z.number().optional(),
  cacheWrite: z.number().optional(),
  batchInput: z.number().optional(),
  batchOutput: z.number().optional(),
  cite,
});

const slugField = z.string().regex(/^[a-z0-9-]+$/);

const models = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/models' }),
  schema: z.object({
    name: z.string(),
    slug: slugField,
    vendor: reference('vendors'),
    family: z.string(),
    tier: z.enum(['flagship', 'reasoning', 'mid', 'small', 'coding', 'open']),
    /** Search-popularity rank (1 = most searched). Drives vs-URL ordering and "top" lists. */
    priority: z.number().int().positive(),
    status: z.enum(['current', 'preview', 'deprecated', 'retired']),
    releaseDate: cited(isoDate),
    /** Month granularity as published by vendors, e.g. "2025-08". */
    knowledgeCutoff: cited(z.string()).optional(),
    modalities: z.object({
      input: z.array(z.enum(['text', 'image', 'audio', 'video', 'pdf'])),
      output: z.array(z.enum(['text', 'image', 'audio'])),
    }),
    /** Tokens. */
    contextWindow: cited(z.number().int().positive()),
    maxOutput: cited(z.number().int().positive()).optional(),
    pricing: price,
    /** e.g. long-context surcharge tiers, per-request minimums. */
    pricingNotes: z.string().optional(),
    api: z.object({
      modelIds: z.array(z.string()).min(1),
      aliases: z.array(z.string()).default([]),
      providers: z.array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          modelId: z.string().optional(),
        }),
      ),
      docsUrl: z.string().url(),
      rateLimitNotes: z.string().optional(),
      cite,
    }),
    benchmarks: z
      .array(
        z.object({
          benchmark: reference('benchmarks'),
          score: z.number(),
          /** e.g. "pass@1", "high reasoning effort", "with tools". */
          variant: z.string().optional(),
          selfReported: z.boolean().default(true),
          cite,
        }),
      )
      .default([]),
    capabilities: z.array(z.string()).default([]),
    /** Meta-description seed. Hand-written, unique per model. */
    description: z.string().max(320),
    /** 2–3 hand-written paragraphs for the hub page. Markdown allowed. */
    summary: z.string(),
    faq,
    predecessor: reference('models').optional(),
    successor: reference('models').optional(),
    lastVerified: isoDate,
  }),
});

const vendors = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/vendors' }),
  schema: z.object({
    name: z.string(),
    slug: slugField,
    url: z.string().url(),
    docsUrl: z.string().url(),
    pricingUrl: z.string().url(),
    statusUrl: z.string().url().optional(),
    description: z.string(),
    /** Official profiles for Organization JSON-LD sameAs. */
    sameAs: z.array(z.string().url()).default([]),
  }),
});

const apps = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/apps' }),
  schema: z.object({
    name: z.string(),
    slug: slugField,
    url: z.string().url(),
    vendorName: z.string(),
    category: z.enum(['ide', 'app-builder', 'cli', 'extension', 'cloud-ide']),
    platforms: z.array(z.enum(['macos', 'windows', 'linux', 'web'])),
    pricingPlans: z.array(
      z.object({
        name: z.string(),
        /** null = custom/enterprise pricing. */
        pricePerMonth: z.number().nullable(),
        annualPricePerMonth: z.number().optional(),
        features: z.array(z.string()),
        cite,
      }),
    ),
    supportedModels: z.array(reference('models')).default([]),
    features: z.array(z.string()),
    description: z.string().max(320),
    summary: z.string(),
    faq,
    lastVerified: isoDate,
  }),
});

const benchmarks = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/benchmarks' }),
  schema: z.object({
    name: z.string(),
    slug: slugField,
    /** One line: what this benchmark measures, e.g. "graduate-level science QA". */
    measures: z.string(),
    scoreType: z.enum(['percent', 'elo', 'score']),
    higherIsBetter: z.boolean().default(true),
    maxScore: z.number().optional(),
    /** Official leaderboard or paper. */
    sourceUrl: z.string().url(),
    description: z.string(),
    methodologyNotes: z.string().optional(),
  }),
});

const comparisons = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/comparisons' }),
  schema: z.object({
    a: reference('models'),
    b: reference('models'),
    /** Hand-written "which should you pick" verdict. Markdown allowed. */
    verdict: z.string().optional(),
    faq,
  }),
});

const prompts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/prompts' }),
  schema: z.object({
    title: z.string(),
    slug: slugField,
    category: z.enum(['coding', 'writing', 'analysis', 'agents', 'image', 'productivity']),
    models: z.array(reference('models')).default([]),
    description: z.string().max(320),
    lastVerified: isoDate,
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    slug: slugField,
    pubDate: isoDate,
    updatedDate: isoDate.optional(),
    description: z.string().max(320),
    tags: z.array(z.string()).default([]),
    sources: z.array(cite).default([]),
  }),
});

const tutorials = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    slug: slugField,
    pubDate: isoDate,
    updatedDate: isoDate.optional(),
    description: z.string().max(320),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    relatedModels: z.array(reference('models')).default([]),
    relatedApps: z.array(reference('apps')).default([]),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    slug: slugField,
    url: z.string().url(),
    category: z.enum(['inference', 'observability', 'evals', 'orchestration', 'vector-db', 'gateway', 'fine-tuning', 'data', 'other']),
    pricingModel: z.enum(['free', 'freemium', 'paid', 'open-source']),
    description: z.string().max(320),
    lastVerified: isoDate,
  }),
});

const directoryEntry = z.object({
  name: z.string(),
  slug: slugField,
  description: z.string().max(320),
  category: z.string(),
  url: z.string().url().optional(),
  relatedModels: z.array(reference('models')).default([]),
  lastVerified: isoDate,
});

const agents = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/agents' }),
  schema: directoryEntry,
});

const templates = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/templates' }),
  schema: directoryEntry,
});

const workflows = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/workflows' }),
  schema: z.object({
    title: z.string(),
    slug: slugField,
    description: z.string().max(320),
    category: z.string(),
    relatedModels: z.array(reference('models')).default([]),
    relatedApps: z.array(reference('apps')).default([]),
    lastVerified: isoDate,
  }),
});

export const collections = {
  models,
  vendors,
  apps,
  benchmarks,
  comparisons,
  prompts,
  news,
  tutorials,
  tools,
  agents,
  templates,
  workflows,
};
