/**
 * Data integrity checks, run in CI before every build.
 *
 *   npm run check:data                 hard validation (exit 1 on failure)
 *   npm run check:data -- --report-stale   additionally print STALE lines for
 *                                          facts not verified in 90 days
 *
 * Checks:
 *  - every entry's `slug` matches its filename
 *  - no generated flat URL (model, model sub-page, comparison) collides with a
 *    reserved section route or another generated slug
 *  - references (vendor, benchmark, predecessor/successor, comparison pairs)
 *    resolve to existing entries
 *  - with --report-stale: any lastVerified / cite.verified older than 90 days
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { RESERVED_SLUGS } from '../src/data/site.ts';

const CONTENT = join(import.meta.dirname, '..', 'src', 'content');
const STALE_DAYS = 90;
const SUBPAGE_SUFFIXES = ['pricing', 'api', 'context-window', 'benchmarks', 'alternatives', 'prompts'];

const reportStale = process.argv.includes('--report-stale');
const errors: string[] = [];
const staleFacts: string[] = [];
const now = Date.now();

type Entry = Record<string, any> & { __file: string };

function loadCollection(name: string): Entry[] {
  const dir = join(CONTENT, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.md'))
    .map((f) => {
      const raw = readFileSync(join(dir, f), 'utf8');
      const source = f.endsWith('.md') ? (raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '') : raw;
      try {
        const data = parseYaml(source) ?? {};
        return { ...data, __file: `${name}/${f}` };
      } catch (e) {
        errors.push(`${name}/${f}: YAML parse error — ${(e as Error).message}`);
        return { __file: `${name}/${f}` };
      }
    });
}

function checkSlugMatchesFile(entries: Entry[]) {
  for (const e of entries) {
    const stem = basename(e.__file, extname(e.__file));
    if (e.slug && e.slug !== stem) errors.push(`${e.__file}: slug "${e.slug}" != filename "${stem}"`);
    if (!e.slug) errors.push(`${e.__file}: missing slug`);
  }
}

function walkForStale(node: any, path: string, file: string) {
  if (node === null || typeof node !== 'object') return;
  if (node instanceof Date) return;
  for (const [key, value] of Object.entries(node)) {
    if ((key === 'verified' || key === 'lastVerified') && value) {
      const d = new Date(value as string);
      if (Number.isNaN(d.getTime())) {
        errors.push(`${file}: invalid date at ${path}${key}`);
      } else if (now - d.getTime() > STALE_DAYS * 86400_000) {
        staleFacts.push(`STALE ${file} ${path}${key} = ${d.toISOString().slice(0, 10)}`);
      }
    } else {
      walkForStale(value, `${path}${key}.`, file);
    }
  }
}

// ---- load ----
const collections: Record<string, Entry[]> = {};
for (const name of readdirSync(CONTENT)) collections[name] = loadCollection(name);

const models = collections.models ?? [];
const vendors = new Set((collections.vendors ?? []).map((v) => v.slug));
const benchmarks = new Set((collections.benchmarks ?? []).map((b) => b.slug));
const modelSlugs = new Set(models.map((m) => m.slug));
const appSlugs = new Set((collections.apps ?? []).map((a) => a.slug));

// ---- slug/filename + per-collection checks ----
// Comparisons have no slug field: their URL derives from the a/b pair.
for (const [name, entries] of Object.entries(collections)) {
  if (name === 'comparisons') {
    for (const e of entries) {
      const stem = basename(e.__file, extname(e.__file));
      if (e.a && e.b && stem !== `${e.a}-vs-${e.b}`) {
        errors.push(`${e.__file}: filename should be "${e.a}-vs-${e.b}"`);
      }
    }
    continue;
  }
  checkSlugMatchesFile(entries);
}

// ---- reference checks ----
for (const m of models) {
  if (m.vendor && !vendors.has(m.vendor)) errors.push(`${m.__file}: unknown vendor "${m.vendor}"`);
  for (const b of m.benchmarks ?? []) {
    if (!benchmarks.has(b.benchmark)) errors.push(`${m.__file}: unknown benchmark "${b.benchmark}"`);
  }
  for (const rel of ['predecessor', 'successor'] as const) {
    if (m[rel] && !modelSlugs.has(m[rel])) errors.push(`${m.__file}: unknown ${rel} "${m[rel]}"`);
  }
}
for (const c of collections.comparisons ?? []) {
  for (const side of ['a', 'b'] as const) {
    if (!modelSlugs.has(c[side])) errors.push(`${c.__file}: unknown model "${c[side]}"`);
  }
}
for (const coll of ['prompts', 'tutorials', 'workflows', 'agents', 'templates']) {
  for (const e of collections[coll] ?? []) {
    for (const ref of e.models ?? e.relatedModels ?? []) {
      if (!modelSlugs.has(ref)) errors.push(`${e.__file}: unknown model ref "${ref}"`);
    }
    for (const ref of e.relatedApps ?? []) {
      if (!appSlugs.has(ref)) errors.push(`${e.__file}: unknown app ref "${ref}"`);
    }
  }
}

// ---- flat-URL collision checks ----
const flat = new Map<string, string>(); // slug -> origin
const claim = (slug: string, origin: string) => {
  if (RESERVED_SLUGS.includes(slug)) errors.push(`${origin}: generated slug "/${slug}" collides with a reserved route`);
  const prev = flat.get(slug);
  if (prev) errors.push(`slug collision: "/${slug}" generated by both ${prev} and ${origin}`);
  flat.set(slug, origin);
};
for (const m of models) {
  if (!m.slug) continue;
  claim(m.slug, m.__file);
  for (const suffix of SUBPAGE_SUFFIXES) claim(`${m.slug}-${suffix}`, m.__file);
}
for (const c of collections.comparisons ?? []) {
  if (c.a && c.b) claim(`${c.a}-vs-${c.b}`, c.__file);
}

// ---- staleness ----
if (reportStale) {
  for (const entries of Object.values(collections)) {
    for (const e of entries) walkForStale(e, '', e.__file);
  }
}

// ---- report ----
const counts = Object.entries(collections)
  .map(([k, v]) => `${k}:${v.length}`)
  .join(' ');
console.log(`check-data: ${counts}`);
console.log(`check-data: ${flat.size} generated flat URLs, ${errors.length} errors`);

if (reportStale && staleFacts.length) {
  console.log(staleFacts.join('\n'));
}
if (errors.length) {
  console.error(errors.map((e) => `  ✗ ${e}`).join('\n'));
  process.exit(1);
}
