import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGhlContact } from './ghl';

describe('createGhlContact', () => {
  const config = {
    apiKey: 'test-key',
    baseUrl: 'https://services.leadconnectorhq.com',
    locationId: 'loc_123',
    tag: 'reggie-lunch-and-learn',
  };

  const payload = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+19105550123',
    businessName: 'Example Services',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('POSTs to /contacts/upsert with the expected body and auth header', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ new: true, contact: { id: '123' } }), { status: 201 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await createGhlContact(payload, config);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.duplicate).toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://services.leadconnectorhq.com/contacts/upsert');
    expect(init.method).toBe('POST');
    expect(init.headers['Authorization']).toBe('Bearer test-key');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.headers['Version']).toBe('2021-07-28');
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      firstName: 'Jane Doe',
      lastName: '',
      email: 'jane@example.com',
      phone: '+19105550123',
      companyName: 'Example Services',
      locationId: 'loc_123',
      tags: ['reggie-lunch-and-learn'],
    });
  });

  it('returns ok=true with duplicate=true when upsert updates an existing contact', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ new: false, contact: { id: '123' } }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await createGhlContact(payload, config);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.duplicate).toBe(true);
  });

  it('returns ok=false on 5xx', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('Internal Server Error', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createGhlContact(payload, config);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/GHL/);
  });

  it('returns ok=false when fetch throws', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createGhlContact(payload, config);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/network down/);
  });
});
