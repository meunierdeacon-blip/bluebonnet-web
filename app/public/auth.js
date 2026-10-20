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

  const notice = form.querySelector('.notice');
  const mode = form.dataset.auth;
  const resetToken = new URLSearchParams(location.search).get('token');
  if (mode === 'reset' && !resetToken) {
    error.textContent = 'This page needs the link from your reset email. Ask for a new one below.';
    error.hidden = false;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button');
    const el = form.elements;
    error.hidden = true;
    notice.hidden = true;
    button.disabled = true;
    try {
      const body = mode === 'forgot' ? { email: el.email.value }
        : mode === 'reset' ? { token: resetToken, password: el.password.value }
        : { email: el.email.value, password: el.password.value };
      await api(`/api/${mode}`, body);
      if (mode === 'forgot') {
        notice.textContent = 'If there’s an account with that email, a reset link is on its way. Check your inbox (and spam).';
        notice.hidden = false;
        return;
      }
      location.href = next;
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    } finally {
      button.disabled = false;
    }
  });
}

document.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', async () => {
  await api('/api/logout');
  location.href = '/';
}));
