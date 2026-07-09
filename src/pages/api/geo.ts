import type { APIRoute } from 'astro';

export const prerender = false;

// Returns the visitor's ISO 3166-1 alpha-2 country code based on Vercel's
// edge-injected request header. No external API call, no extra cost, no key.
// Falls back to AU when the header is absent (local dev / unknown geo).
export const GET: APIRoute = async ({ request }) => {
  const country = request.headers.get('x-vercel-ip-country') || 'AU';
  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      // Cache per-IP for a few minutes at the edge. Country doesn't change
      // mid-session; this avoids re-invocation on repeat popup opens.
      'cache-control': 'private, max-age=300',
    },
  });
};
