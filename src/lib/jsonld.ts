import { SITE } from '../data/site';

/** Typed JSON-LD builders. Pages pass the results to <SEO jsonld={[...]}>. */

const abs = (path: string) => new URL(path, SITE.url).href;

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: abs('/favicon.svg'),
    sameAs: [SITE.github],
  };
}

export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbs(items: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: abs(item.path) } : {}),
    })),
  };
}

export function softwareApplication(opts: {
  name: string;
  path: string;
  description: string;
  vendorName: string;
  vendorUrl: string;
  releaseDate?: Date;
  /** USD per 1M input tokens (models) or monthly price (apps). */
  price?: number;
  priceDescription?: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    url: abs(opts.path),
    description: opts.description,
    applicationCategory: opts.category ?? 'DeveloperApplication',
    operatingSystem: 'Any',
    ...(opts.releaseDate ? { datePublished: opts.releaseDate.toISOString().slice(0, 10) } : {}),
    publisher: { '@type': 'Organization', name: opts.vendorName, url: opts.vendorUrl },
    ...(opts.price !== undefined
      ? {
          offers: {
            '@type': 'Offer',
            price: opts.price,
            priceCurrency: 'USD',
            ...(opts.priceDescription ? { description: opts.priceDescription } : {}),
          },
        }
      : {}),
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function article(opts: {
  type?: 'Article' | 'NewsArticle' | 'TechArticle';
  title: string;
  path: string;
  description: string;
  published: Date;
  updated?: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'Article',
    headline: opts.title,
    url: abs(opts.path),
    description: opts.description,
    datePublished: opts.published.toISOString().slice(0, 10),
    ...(opts.updated ? { dateModified: opts.updated.toISOString().slice(0, 10) } : {}),
    author: { '@id': `${SITE.url}/#organization` },
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export function dataset(opts: { name: string; path: string; description: string; updated: Date }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: opts.name,
    url: abs(opts.path),
    description: opts.description,
    dateModified: opts.updated.toISOString().slice(0, 10),
    creator: { '@id': `${SITE.url}/#organization` },
    license: `${SITE.github}/blob/main/LICENSE`,
    isAccessibleForFree: true,
  };
}
