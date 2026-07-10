import type { APIRoute } from 'astro';
import { fetchLandingCloneHtml } from '../lib/liveProxy';

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
    return new Response(
      `<html><body><h1>Landing page unavailable</h1><p>${error instanceof Error ? error.message : 'Unknown error'}</p></body></html>`,
      {
        status: 502,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
        },
      },
    );
  }
};
