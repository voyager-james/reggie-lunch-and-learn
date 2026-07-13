# Reggie Lunch & Learn Astro Funnel

Native Astro 6 implementation of the Lunch & Learn funnel for Reggie Shropshire / ActionCOACH.

## Routes

- `/` permanently redirects to `/lunch-and-learn`
- `/lunch-and-learn` is the prerendered landing page
- `/lunch-and-learn-thank` is the prerendered thank-you page
- `/api/register` is the server-rendered GoHighLevel registration endpoint
- `/api/geo` returns Vercel country geolocation with a US fallback

## Tracking and Performance

Meta Pixel is intentionally bootstrapped early in the document head on both marketing pages. It is not delayed for Lighthouse. Microsoft Clarity loads after the page has rendered. The YouTube video uses a local Astro-optimized thumbnail facade and does not request YouTube resources until the play button is clicked.

## Environment

Copy `.env.example` values into the Vercel project settings:

```sh
GHL_API_KEY=
GHL_BASE_URL=https://services.leadconnectorhq.com
GHL_LOCATION_ID=
PUBLIC_META_PIXEL_ID=696932649599462
PUBLIC_CLARITY_ID=xb8s5tf5lm
```

## Commands

```sh
npm run astro -- sync
npm run astro -- check
npm test
npm run test:e2e
npm run build
```

The project targets Node `24.x` to match Vercel.
