import type { APIRoute, GetStaticPaths } from 'astro';
import { getOgEntries } from '../../lib/routes';
import { renderOg, type OgSpec } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getOgEntries();
  return [...entries].map(([slug, spec]) => ({ params: { slug }, props: { spec } }));
};

export const GET: APIRoute<{ spec: OgSpec }> = async ({ props }) => {
  const png = await renderOg(props.spec);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
