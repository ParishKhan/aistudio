// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

// https://astro.build/config
export default defineConfig({
  site: 'https://aistudio.quest',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/search') && !page.includes('/styleguide'),
    }),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
