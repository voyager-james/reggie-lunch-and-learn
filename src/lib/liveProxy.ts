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

export async function fetchLandingCloneHtml() {
  const response = await fetch(LANDING_SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch landing page: ${response.status}`);
  }

  let html = await response.text();
  html = normalizeHtml(html);
  html = replaceThankYouLinks(html);
  html = injectBeforeBodyEnd(html, INTERCEPT_SCRIPT);
  return html;
}

export async function fetchThankYouCloneHtml() {
  const response = await fetch(THANK_YOU_SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch thank-you page: ${response.status}`);
  }

  let html = await response.text();
  html = normalizeHtml(html);
  html = injectBeforeBodyEnd(html, LEAD_SCRIPT);
  return html;
}
