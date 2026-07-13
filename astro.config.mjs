// @ts-check
import { defineConfig, envField } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  build: {
    inlineStylesheets: 'always',
  },
  env: {
    schema: {
      GHL_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      GHL_BASE_URL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'https://services.leadconnectorhq.com',
      }),
      GHL_LOCATION_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_META_PIXEL_ID: envField.string({
        context: 'client',
        access: 'public',
        default: '696932649599462',
      }),
      PUBLIC_CLARITY_ID: envField.string({
        context: 'client',
        access: 'public',
        default: 'xb8s5tf5lm',
      }),
    },
  },
  vite: {
    cacheDir: '.tmp-vite/default',
  },
});
