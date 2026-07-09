import type { APIRoute } from 'astro';
import { createGhlContact } from '../../lib/ghl';
import { webinar, type RegistrationPayload } from '../../config/webinar';

export const prerender = false;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function validate(input: unknown): RegistrationPayload | null {
  if (!input || typeof input !== 'object') return null;
  const o = input as Record<string, unknown>;
  const required = ['fullName', 'email', 'phone', 'businessName'] as const;

  const out: Record<string, string> = {};
  for (const key of required) {
    const v = o[key];
    if (typeof v !== 'string') return null;
    const trimmed = v.trim().replace(/\s+/g, ' ');
    if (trimmed.length === 0) return null;
    out[key] = trimmed;
  }
  if (!EMAIL_RE.test(out.email)) return null;
  return out as RegistrationPayload;
}

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' });
  }

  const payload = validate(raw);
  if (!payload) {
    return json(400, { ok: false, error: 'Please fill all fields with valid values.' });
  }

  const apiKey = import.meta.env.GHL_API_KEY;
  const baseUrl = import.meta.env.GHL_BASE_URL ?? 'https://services.leadconnectorhq.com';
  const locationId = import.meta.env.GHL_LOCATION_ID;
  const roleFieldId = import.meta.env.GHL_ROLE_FIELD_ID;

  if (!apiKey || !locationId || !roleFieldId) {
    console.error('GHL_API_KEY, GHL_LOCATION_ID or GHL_ROLE_FIELD_ID is not configured');
    return json(502, { ok: false, error: 'Registration is temporarily unavailable.' });
  }

  const result = await createGhlContact(payload, {
    apiKey,
    baseUrl,
    locationId,
    tag: webinar.ghlTag,
    roleFieldId,
    roleValue: webinar.roleValue,
  });

  if (!result.ok) {
    console.error('GHL error:', result.error);
    return json(502, { ok: false, error: 'Could not complete registration. Please try again.' });
  }

  return json(200, { ok: true });
};
