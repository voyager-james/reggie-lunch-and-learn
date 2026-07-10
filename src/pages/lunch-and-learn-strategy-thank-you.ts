import type { APIRoute } from 'astro';
import { fetchThankYouCloneHtml } from '../lib/liveProxy';

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
    return new Response(
      `<html><body><h1>Thank-you page unavailable</h1><p>${error instanceof Error ? error.message : 'Unknown error'}</p></body></html>`,
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
