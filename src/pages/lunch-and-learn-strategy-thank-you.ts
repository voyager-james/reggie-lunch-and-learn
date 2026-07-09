import type { APIRoute } from 'astro';
import { fetchThankYouCloneHtml } from '../lib/liveProxy';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const html = await fetchThankYouCloneHtml();
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to serve thank-you clone', error);
    return new Response('Could not load thank-you page.', {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
};
