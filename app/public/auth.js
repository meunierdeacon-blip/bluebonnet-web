// Sign-up / log-in forms and the log-out button.
export const api = async (path, body, method = 'POST') => {
  const res = await fetch(path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
};

const form = document.querySelector('[data-auth]');
if (form) {
  const error = form.querySelector('.error');
  // ?next=publish comes from the builder's "Save & publish" button
  const next = new URLSearchParams(location.search).get('next') === 'publish' ? '/build?publish=1' : '/build';
  document.querySelectorAll('.auth a[href="/login"], .auth a[href="/signup"]').forEach((a) => { a.search = location.search; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button');
    error.hidden = true;
    button.disabled = true;
    try {
      await api(`/api/${form.dataset.auth}`, { email: form.elements.email.value, password: form.elements.password.value });
      location.href = next;
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
      button.disabled = false;
    }
  });
}

document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', async () => {
  await api('/api/logout');
  location.href = '/';
}));
