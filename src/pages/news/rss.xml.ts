import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../../data/site';

export async function GET(context: APIContext) {
  const news = (await getCollection('news')).sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  return rss({
    title: `${SITE.name} — AI News`,
    description: 'Model releases and pricing changes across the AI industry, with sources.',
    site: context.site!,
    items: news.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      pubDate: item.data.pubDate,
      link: `/news/${item.data.slug}`,
    })),
    stylesheet: false,
  });
}
