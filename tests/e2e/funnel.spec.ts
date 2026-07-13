import { expect, test } from '@playwright/test';

const blockedLegacyHosts = /gohighlevel|leadconnector|msgsndr|actioncoachlp\.com/i;
const youtubeHosts = /youtube(?:-nocookie)?\.com|ytimg\.com|googlevideo\.com/i;

test('routes are correct', async ({ request }) => {
  const root = await request.get('/', { maxRedirects: 0 });
  expect(root.status()).toBe(308);
  expect(root.headers().location).toBe('/lunch-and-learn');

  const landing = await request.get('/lunch-and-learn');
  expect(landing.ok()).toBe(true);
  const thank = await request.get('/lunch-and-learn-thank');
  expect(thank.ok()).toBe(true);
});

test('landing page loads Facebook immediately and avoids GHL and YouTube before interaction', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto('/lunch-and-learn');
  await expect(page.getByRole('heading', { name: /You've Grown Your Business/i })).toBeVisible();
  await page.waitForTimeout(750);

  expect(requests.some((url) => url.includes('connect.facebook.net'))).toBe(true);
  expect(requests.filter((url) => blockedLegacyHosts.test(url))).toEqual([]);
  expect(requests.filter((url) => youtubeHosts.test(url))).toEqual([]);

  const youtubeRequest = page.waitForRequest((request) =>
    request.url().includes('youtube-nocookie.com/embed/wm9ym-L2i8Q'),
  );
  await page.getByRole('button', { name: /play why business owners get stuck/i }).click();
  await youtubeRequest;
});

test('landing page is readable, overflow-free, and touch-friendly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lunch-and-learn');

  const mobileLayout = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const visibleButtons = [...document.querySelectorAll<HTMLButtonElement>('button')]
      .filter((button) => button.offsetParent !== null && !button.closest('[data-youtube-facade]'))
      .map((button) => button.getBoundingClientRect().height);

    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      h1Size: Number.parseFloat(getComputedStyle(h1!).fontSize),
      smallestButton: Math.min(...visibleButtons),
    };
  });

  expect(mobileLayout.scrollWidth).toBe(mobileLayout.clientWidth);
  expect(mobileLayout.h1Size).toBeGreaterThanOrEqual(30);
  expect(mobileLayout.smallestButton).toBeGreaterThanOrEqual(44);

  await page.getByRole('button', { name: 'Reserve Your Seat', exact: true }).click();
  const dialog = page.locator('#register-popup');
  await expect(dialog).toBeVisible();

  const modalLayout = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
      overflowY: getComputedStyle(element).overflowY,
    };
  });

  expect(modalLayout.top).toBeGreaterThanOrEqual(0);
  expect(modalLayout.bottom).toBeLessThanOrEqual(modalLayout.viewportHeight);
  expect(modalLayout.overflowY).toBe('auto');
});

test('thank-you page loads Facebook immediately without GHL or YouTube requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.goto('/lunch-and-learn-thank');
  await expect(page.getByRole('heading', { name: /You've taken the first step/i })).toBeVisible();
  await page.waitForTimeout(750);

  expect(requests.some((url) => url.includes('connect.facebook.net'))).toBe(true);
  expect(requests.filter((url) => blockedLegacyHosts.test(url))).toEqual([]);
  expect(requests.filter((url) => youtubeHosts.test(url))).toEqual([]);
});

test('registration modal validates, traps focus, tracks Lead once, and redirects', async ({ page }) => {
  await page.addInitScript(() => {
    window.fbq = (...args: unknown[]) => {
      const current = JSON.parse(localStorage.getItem('fbqCalls') || '[]');
      current.push(args);
      localStorage.setItem('fbqCalls', JSON.stringify(current));
    };
  });

  await page.route('**/api/geo', async (route) => {
    await route.fulfill({ json: { country: 'US' } });
  });
  await page.route('**/api/register', async (route) => {
    const body = route.request().postDataJSON();
    expect(body).toEqual({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+19105550123',
      businessName: 'Example Services',
    });
    await route.fulfill({ json: { ok: true } });
  });

  await page.goto('/lunch-and-learn');
  await page.getByRole('button', { name: /^Register for Lunch and Learn/i }).first().click();

  const dialog = page.locator('#register-popup');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#reg-country')).toHaveValue('US');
  await expect(page.locator('#reg-country option:checked')).toContainText('🇺🇸 +1');
  const modalLayout = await page.locator('.popup-card').evaluate((card) => ({
    scrollHeight: card.scrollHeight,
    clientHeight: card.clientHeight,
    overflowY: getComputedStyle(card).overflowY,
  }));
  expect(modalLayout.scrollHeight).toBe(modalLayout.clientHeight);
  expect(modalLayout.overflowY).toBe('visible');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();

  await page.getByRole('button', { name: /^Register for Lunch and Learn/i }).last().click();
  await expect(page.locator('#reg-fullName-error')).toContainText('Enter your full name');

  await page.locator('#reg-fullName').fill('Jane Doe');
  await page.locator('#reg-email').fill('jane@example.com');
  await page.locator('#reg-phone').fill('(910) 555-0123');
  await page.locator('#reg-businessName').fill('Example Services');
  await page.getByRole('button', { name: /^Register for Lunch and Learn/i }).last().click();

  await expect(page).toHaveURL(/\/lunch-and-learn-thank$/);
  const leadCalls = await page.evaluate(() => {
    const calls = JSON.parse(localStorage.getItem('fbqCalls') || '[]') as unknown[][];
    return calls.filter((call) => call[0] === 'track' && call[1] === 'Lead').length;
  });
  expect(leadCalls).toBe(1);

  await page.reload();
  const leadCallsAfterReload = await page.evaluate(() => {
    const calls = JSON.parse(localStorage.getItem('fbqCalls') || '[]') as unknown[][];
    return calls.filter((call) => call[0] === 'track' && call[1] === 'Lead').length;
  });
  expect(leadCallsAfterReload).toBe(1);
});
