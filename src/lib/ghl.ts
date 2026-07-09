import type { RegistrationPayload } from '../config/webinar';

export type GhlConfig = {
  apiKey: string;
  baseUrl: string;
  locationId: string;
  tag: string;
  roleFieldId: string;
  roleValue: string;
};

export type GhlResult =
  | { ok: true; duplicate?: boolean }
  | { ok: false; error: string };

export async function createGhlContact(
  payload: RegistrationPayload,
  config: GhlConfig,
): Promise<GhlResult> {
  const body = {
    firstName: payload.fullName,
    lastName: '',
    email: payload.email,
    phone: payload.phone,
    companyName: payload.businessName,
    locationId: config.locationId,
    tags: [config.tag],
    customFields: [{ id: config.roleFieldId, field_value: config.roleValue }],
  };

  try {
    const res = await fetch(`${config.baseUrl}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
      body: JSON.stringify(body),
    });

    if (res.status >= 200 && res.status < 300) {
      const data = (await res.json().catch(() => null)) as { new?: boolean } | null;
      return { ok: true, duplicate: data?.new === false };
    }

    const text = await res.text().catch(() => '');
    return { ok: false, error: `GHL ${res.status}: ${text.slice(0, 200)}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    return { ok: false, error: msg };
  }
}
