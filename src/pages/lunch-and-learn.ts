import type { APIRoute } from 'astro';
import { fetchLandingCloneHtml } from '../lib/liveProxy';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const html = await fetchLandingCloneHtml();
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to serve landing clone', error);
    return new Response('Could not load landing page.', {
      status: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
};
