import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/ghl', () => ({
  createGhlContact: vi.fn(),
}));

import { POST } from './register';
import { createGhlContact } from '../../lib/ghl';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const valid = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+19105550123',
  businessName: 'Example Services',
};

beforeEach(() => {
  vi.mocked(createGhlContact).mockReset();
  vi.stubEnv('GHL_API_KEY', 'test-key');
  vi.stubEnv('GHL_BASE_URL', 'https://services.leadconnectorhq.com');
  vi.stubEnv('GHL_LOCATION_ID', 'loc_123');
  vi.stubEnv('GHL_ROLE_FIELD_ID', 'field_role_123');
});

describe('POST /api/register', () => {
  it('returns 200 when GHL succeeds', async () => {
    vi.mocked(createGhlContact).mockResolvedValue({ ok: true });
    const res = await POST({ request: makeRequest(valid) } as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('returns 400 when fields are missing', async () => {
    const res = await POST({ request: makeRequest({ ...valid, email: '' }) } as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  it('returns 400 when email is malformed', async () => {
    const res = await POST({ request: makeRequest({ ...valid, email: 'not-an-email' }) } as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when body is not JSON', async () => {
    const res = await POST({ request: makeRequest('not json {{{') } as any);
    expect(res.status).toBe(400);
  });

  it('returns 502 when GHL fails', async () => {
    vi.mocked(createGhlContact).mockResolvedValue({ ok: false, error: 'GHL 500' });
    const res = await POST({ request: makeRequest(valid) } as any);
    expect(res.status).toBe(502);
  });

  it('trims whitespace from fields before validation', async () => {
    vi.mocked(createGhlContact).mockResolvedValue({ ok: true });
    const res = await POST({
      request: makeRequest({ ...valid, fullName: '  Jane Doe  ' }),
    } as any);
    expect(res.status).toBe(200);
    const passedPayload = vi.mocked(createGhlContact).mock.calls[0][0];
    expect(passedPayload.fullName).toBe('Jane Doe');
  });
});
