const LANDING_SOURCE_URL = 'https://goreggie.actioncoachlp.com/lunch-and-learn';
const THANK_YOU_SOURCE_URL =
  'https://goreggie.actioncoachlp.com/lunch-and-learn-strategy-thank-you';

const INTERCEPT_SCRIPT = `
<script>
(function () {
  var THANK_YOU_PATH = '/lunch-and-learn-strategy-thank-you';
  var API_PATH = '/api/register';
  var FIELD_SELECTORS = {
    fullName: ['input[name="full_name"]', 'input[name="fullName"]'],
    email: ['input[name="email"]'],
    phone: ['input[name="phone"]'],
    businessName: ['input[name="business_name"]', 'input[name="businessName"]']
  };

  function findField(form, selectors) {
    for (var i = 0; i < selectors.length; i += 1) {
      var field = form.querySelector(selectors[i]);
      if (field) return field;
    }
    return null;
  }

  function readPayload(form) {
    var fullNameField = findField(form, FIELD_SELECTORS.fullName);
    var emailField = findField(form, FIELD_SELECTORS.email);
    var phoneField = findField(form, FIELD_SELECTORS.phone);
    var businessField = findField(form, FIELD_SELECTORS.businessName);
    if (!fullNameField || !emailField || !phoneField || !businessField) return null;

    return {
      fullName: fullNameField.value || '',
      email: emailField.value || '',
      phone: phoneField.value || '',
      businessName: businessField.value || ''
    };
  }

  function getErrorNode(form) {
    var existing = form.querySelector('[data-local-register-error]');
    if (existing) return existing;
    var node = document.createElement('p');
    node.setAttribute('data-local-register-error', '');
    node.style.color = '#ff6b6b';
    node.style.fontSize = '14px';
    node.style.marginTop = '12px';
    form.appendChild(node);
    return node;
  }

  async function handleSubmit(event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    var payload = readPayload(form);
    if (!payload) return;

    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();

    var submitButton = form.querySelector('button[type="submit"], button:not([type]), input[type="submit"]');
    var originalText = submitButton && 'value' in submitButton ? submitButton.value : submitButton && submitButton.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      if ('value' in submitButton) submitButton.value = 'Registering...';
      else submitButton.textContent = 'Registering...';
    }

    var errorNode = getErrorNode(form);
    errorNode.textContent = '';

    try {
      var response = await fetch(API_PATH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var body = await response.json().catch(function () {
        return { ok: false, error: 'Bad response' };
      });

      if (!response.ok || !body.ok) {
        throw new Error(body.error || 'Registration failed. Please try again.');
      }

      window.location.href = THANK_YOU_PATH;
    } catch (error) {
      errorNode.textContent = error && error.message ? error.message : 'Registration failed. Please try again.';
      if (submitButton) {
        submitButton.disabled = false;
        if ('value' in submitButton) submitButton.value = originalText || 'Register';
        else submitButton.textContent = originalText || 'Register';
      }
    }
  }

  document.addEventListener('submit', handleSubmit, true);
})();
</script>`;

const LEAD_SCRIPT = `
<script>
if (typeof fbq === 'function') {
  fbq('track', 'Lead', { content_name: 'Lunch and Learn Registration' });
}
</script>`;

function pixelScript() {
  const pixelId = import.meta.env.PUBLIC_META_PIXEL_ID;
  if (!pixelId) return '';

  return `
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', 'false', '${pixelId}');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />
</noscript>`;
}

function deferSourceScripts(scriptUrls: string[]) {
  if (!scriptUrls.length) return '';

  return `
<script>
(function () {
  var urls = ${JSON.stringify(scriptUrls)};
  var loaded = false;

  function loadScripts() {
    if (loaded) return;
    loaded = true;
    urls.forEach(function (url) {
      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      document.body.appendChild(script);
    });
  }

  window.addEventListener('pointerdown', loadScripts, { once: true, passive: true, capture: true });
  window.addEventListener('keydown', loadScripts, { once: true, passive: true, capture: true });
  window.addEventListener('touchstart', loadScripts, { once: true, passive: true, capture: true });

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadScripts, { timeout: 8000 });
  } else {
    window.setTimeout(loadScripts, 8000);
  }
})();
</script>`;
}

function injectBeforeBodyEnd(html: string, injection: string) {
  if (html.includes('</body>')) {
    return html.replace('</body>', `${injection}</body>`);
  }
  return `${html}${injection}`;
}

function replaceThankYouLinks(html: string) {
  return html
    .replaceAll(THANK_YOU_SOURCE_URL, '/lunch-and-learn-strategy-thank-you')
    .replaceAll('https://goreggie.actioncoachlp.com/lunch-and-learn-strategy-thank-you', '/lunch-and-learn-strategy-thank-you');
}

function normalizeHtml(html: string) {
  return html.replace(
    /<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?>/gi,
    '',
  );
}

function extractDeferredScripts(html: string) {
  const urls: string[] = [];

  const strippedHtml = html.replace(/<script\b[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (_match, src: string) => {
    if (/stcdn\.leadconnectorhq\.com|services\.leadconnectorhq\.com/i.test(src)) {
      urls.push(src);
      return '';
    }

    return '';
  });

  return {
    html: strippedHtml.replace(/<script\b(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi, ''),
    urls,
  };
}

function stripHeavyLinks(html: string) {
  return html
    .replace(/<link\b[^>]+href=["'][^"']*stcdn\.leadconnectorhq\.com\/_preview\/[^"']+["'][^>]*>/gi, '')
    .replace(/<link\b[^>]+href=["'][^"']*services\.leadconnectorhq\.com[^"']*["'][^>]*>/gi, '')
    .replace(/<link\b[^>]+href=["'][^"']*backend\.leadconnectorhq\.com[^"']*["'][^>]*>/gi, '')
    .replace(/<link\b[^>]+href=["'][^"']*images\.leadconnectorhq\.com[^"']*["'][^>]*>/gi, '')
    .replace(/<link\b[^>]+href=["'][^"']*cdn\.filesafe\.space[^"']*["'][^>]*>/gi, '');
}

function optimizeImages(html: string) {
  let imageIndex = 0;

  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    imageIndex += 1;
    let next = tag;

    if (!/\bdecoding=/i.test(next)) {
      next = next.replace('<img', '<img decoding="async"');
    }

    if (!/\bloading=/i.test(next)) {
      next = next.replace(
        '<img',
        imageIndex <= 2 ? '<img loading="eager"' : '<img loading="lazy"',
      );
    }

    if (!/\bfetchpriority=/i.test(next)) {
      next = next.replace(
        '<img',
        imageIndex <= 2 ? '<img fetchpriority="high"' : '<img fetchpriority="low"',
      );
    }

    return next;
  });
}

export async function fetchLandingCloneHtml() {
  const response = await fetch(LANDING_SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch landing page: ${response.status}`);
  }

  let html = await response.text();
  html = normalizeHtml(html);
  const extracted = extractDeferredScripts(html);
  html = extracted.html;
  html = stripHeavyLinks(html);
  html = optimizeImages(html);
  html = replaceThankYouLinks(html);
  html = injectBeforeBodyEnd(html, `${pixelScript()}${deferSourceScripts(extracted.urls)}${INTERCEPT_SCRIPT}`);
  return html;
}

export async function fetchThankYouCloneHtml() {
  const response = await fetch(THANK_YOU_SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch thank-you page: ${response.status}`);
  }

  let html = await response.text();
  html = normalizeHtml(html);
  const extracted = extractDeferredScripts(html);
  html = extracted.html;
  html = stripHeavyLinks(html);
  html = optimizeImages(html);
  html = injectBeforeBodyEnd(html, `${pixelScript()}${deferSourceScripts(extracted.urls)}${LEAD_SCRIPT}`);
  return html;
}
