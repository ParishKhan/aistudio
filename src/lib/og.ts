import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export interface OgSpec {
  title: string;
  /** Small line above the title, e.g. "Model · OpenAI". */
  kicker?: string;
  /** Up to 3 label/value pairs rendered along the bottom. */
  stats?: { label: string; value: string }[];
}

const CACHE_DIR = join(process.cwd(), '.og-cache');

let fontsPromise: Promise<{ name: string; data: Buffer; weight: 600 | 700 }[]> | null = null;

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(process.cwd(), 'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff')).then((data) => ({
      name: 'Inter',
      data,
      weight: 700 as const,
    })),
    readFile(join(process.cwd(), 'node_modules/@fontsource/inter/files/inter-latin-600-normal.woff')).then((data) => ({
      name: 'Inter',
      data,
      weight: 600 as const,
    })),
    readFile(
      join(process.cwd(), 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff'),
    ).then((data) => ({ name: 'JetBrains Mono', data, weight: 600 as const })),
  ]);
  return fontsPromise;
}

const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
  type,
  props: { style, children },
});

function template(spec: OgSpec) {
  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      backgroundColor: '#151312',
      color: '#e7e5e4',
      fontFamily: 'Inter',
    },
    [
      // Brand row
      el('div', { display: 'flex', alignItems: 'center', gap: '14px' }, [
        el('div', { width: '22px', height: '22px', backgroundColor: '#e8590c' }),
        el('div', { fontSize: '30px', fontWeight: 700, letterSpacing: '-0.5px' }, 'AIStudio'),
      ]),
      // Title block
      el('div', { display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1000px' }, [
        ...(spec.kicker
          ? [
              el(
                'div',
                {
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#a8a29e',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                },
                spec.kicker,
              ),
            ]
          : []),
        el(
          'div',
          {
            fontSize: spec.title.length > 45 ? '56px' : '68px',
            fontWeight: 700,
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
          },
          spec.title,
        ),
      ]),
      // Stats row
      el(
        'div',
        {
          display: 'flex',
          gap: '56px',
          borderTop: '1px solid #44403c',
          paddingTop: '36px',
          alignItems: 'flex-end',
        },
        [
          ...(spec.stats ?? []).map((s) =>
            el('div', { display: 'flex', flexDirection: 'column', gap: '8px' }, [
              el(
                'div',
                { fontSize: '20px', fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '2px' },
                s.label,
              ),
              el('div', { fontSize: '40px', fontWeight: 600, fontFamily: 'JetBrains Mono', color: '#f97316' }, s.value),
            ]),
          ),
          el('div', { marginLeft: 'auto', fontSize: '22px', color: '#736d67', fontFamily: 'JetBrains Mono' }, 'aistudio.quest'),
        ],
      ),
    ],
  );
}

export async function renderOg(spec: OgSpec): Promise<Buffer> {
  const key = createHash('sha256').update(JSON.stringify(spec)).digest('hex').slice(0, 20);
  const cached = join(CACHE_DIR, `${key}.png`);
  if (existsSync(cached)) return readFile(cached);

  const fonts = await loadFonts();
  const svg = await satori(template(spec) as any, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cached, png);
  return Buffer.from(png);
}
