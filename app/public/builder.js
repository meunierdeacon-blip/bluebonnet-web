// The builder: a form on the left, a live preview on the right, autosave, and publishing.
// The preview uses the same renderer as the live site (mockup/render.mjs), so what you see is what gets published.
import { renderMockup } from '/lib/render.mjs';
import { PRESETS, DEFAULT_PRESET, THEMES } from '/lib/presets.mjs';
import { api } from './auth.js';

const $ = (sel, el = document) => el.querySelector(sel);
const form = $('.panel');
const f = form.elements; // not form.name: that's the form's own name attribute
const iframe = $('.frame iframe');
const statusEl = $('.status');
const liveLink = $('.live');
const dialog = $('dialog.published');
const plansDialog = $('dialog.plans');
const billingButton = $('[data-billing]');
const loggedIn = $('.builder').dataset.loggedIn === 'yes';
const params = new URLSearchParams(location.search);
const DRAFT_KEY = 'bluebonnet-draft';
const OTHER = '__other';

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const presetFor = (trade) => PRESETS[trade] || DEFAULT_PRESET;
const presetServices = (trade) => presetFor(trade).services.map(([name, blurb]) => ({ name, blurb }));
const sameServices = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const blank = (trade = 'lawn care') => ({
  name: '', trade, town: '', areas: [], phone: '', email: '', texts: true,
  headline: '', intro: '', cta: '', about: '', theme: '', services: presetServices(trade),
});

// Same as toLead in server.mjs: drop empty fields so the renderer falls back to the trade's starter copy
const toLead = (s) => Object.fromEntries(Object.entries(s).filter(([, v]) => v !== '' && !(Array.isArray(v) && !v.length)));

const storage = {
  get() { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; } },
  set(v) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(v)); } catch { /* private mode: the preview still works */ } },
  clear() { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } },
};

let site = blank();
let published = false;

// ---------- Form setup
for (const [trade, p] of Object.entries(PRESETS)) f.trade.add(new Option(`${p.icon} ${titleCase(trade)}`, trade));
f.trade.add(new Option('⭐ Something else', OTHER));

const themeButtons = [['', 'Suggested'], ...Object.keys(THEMES).map((k) => [k, titleCase(k)])].map(([key, label]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.setAttribute('role', 'radio');
  b.dataset.theme = key;
  const t = THEMES[key];
  b.innerHTML = '<span class="swatch"></span>';
  b.append(label);
  b.firstChild.style.background = t ? `linear-gradient(135deg, ${t.hero1} 0 55%, ${t.accent} 55%)` : 'conic-gradient(#2f7d4f, #2b7de9, #e63946, #d9622b, #2f7d4f)';
  b.addEventListener('click', () => { site.theme = key; syncThemes(); changed(); });
  $('.themes').append(b);
  return b;
});
const syncThemes = () => themeButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.theme === site.theme)));

function renderServices() {
  const box = $('.services');
  box.replaceChildren(...site.services.map((s, i) => {
    const row = document.createElement('div');
    row.className = 'service';
    row.innerHTML = `<input aria-label="Service name" maxlength="60" placeholder="Service name">
      <textarea aria-label="Service description" maxlength="200" rows="2" placeholder="One or two sentences about it"></textarea>
      <button type="button" class="remove" aria-label="Remove this service">✕</button>`;
    const [name, blurb] = row.querySelectorAll('input, textarea');
    name.value = s.name;
    blurb.value = s.blurb;
    name.addEventListener('input', () => { site.services[i].name = name.value; changed(); });
    blurb.addEventListener('input', () => { site.services[i].blurb = blurb.value; changed(); });
    row.querySelector('.remove').addEventListener('click', () => { site.services.splice(i, 1); renderServices(); changed(); });
    return row;
  }));
  $('[data-add-service]').hidden = site.services.length >= 8;
}
$('[data-add-service]').addEventListener('click', () => {
  site.services.push({ name: '', blurb: '' });
  renderServices();
  $('.service:last-child input').focus();
});

function setPlaceholders() {
  const p = presetFor(site.trade);
  f.headline.placeholder = p.headline;
  f.intro.placeholder = p.intro.replaceAll('{town}', site.town || 'your town');
  f.cta.placeholder = p.cta;
}

function fillForm() {
  for (const k of ['name', 'town', 'phone', 'email', 'headline', 'intro', 'cta', 'about']) f[k].value = site[k] || '';
  f.areas.value = site.areas.join(', ');
  f.texts.checked = site.texts !== false;
  const known = !!PRESETS[site.trade];
  f.trade.value = known ? site.trade : OTHER;
  f.otherTrade.value = known ? '' : site.trade;
  $('[data-other-trade]').hidden = known;
  setPlaceholders();
  renderServices();
  syncThemes();
}

form.addEventListener('input', (e) => {
  const { name } = e.target;
  if (!name) return; // service rows handle themselves
  if (name === 'trade' || name === 'otherTrade') {
    const before = site.trade;
    const other = f.trade.value === OTHER;
    $('[data-other-trade]').hidden = !other;
    site.trade = other ? f.otherTrade.value.trim().toLowerCase() : f.trade.value;
    // Swap in the new trade's starter services, unless the owner already wrote their own
    if (sameServices(site.services, presetServices(before))) { site.services = presetServices(site.trade); renderServices(); }
    if (name === 'trade' && other) f.otherTrade.focus();
  } else if (name === 'areas') {
    site.areas = f.areas.value.split(',').map((a) => a.trim()).filter(Boolean);
  } else if (name === 'texts') {
    site.texts = f.texts.checked;
  } else {
    site[name] = f[name].value;
  }
  setPlaceholders();
  changed();
});
form.addEventListener('submit', (e) => e.preventDefault());

// ---------- Preview
let lastHtml = '';
function preview() {
  const lead = toLead({
    ...site,
    name: site.name.trim() || 'Your Business Name',
    town: site.town.trim() || 'Your Town',
    trade: site.trade || 'local service',
    services: site.services.filter((s) => s.name.trim()),
  });
  const html = renderMockup(lead, { final: true, quiet: true });
  if (html === lastHtml) return;
  lastHtml = html;
  const doc = iframe.contentDocument;
  // After the first load, swap the content in place so the preview keeps its scroll position while typing
  if (doc?.body?.childElementCount) {
    const next = new DOMParser().parseFromString(html, 'text/html');
    doc.head.innerHTML = next.head.innerHTML;
    doc.body.innerHTML = next.body.innerHTML;
  } else {
    iframe.srcdoc = html;
  }
}

// ---------- Saving
const setStatus = (text, kind = '') => { statusEl.textContent = text; statusEl.dataset.kind = kind; };
let saveTimer;
let previewFrame;
function changed() {
  cancelAnimationFrame(previewFrame);
  previewFrame = requestAnimationFrame(preview);
  clearTimeout(saveTimer);
  if (loggedIn) setStatus('Unsaved changes');
  saveTimer = setTimeout(save, loggedIn ? 900 : 300);
}

let saving = Promise.resolve(true);
function save() {
  clearTimeout(saveTimer);
  if (!loggedIn) {
    storage.set(site);
    setStatus('Draft saved in this browser');
    return Promise.resolve(true);
  }
  saving = saving.then(async () => {
    setStatus('Saving…');
    try {
      const { site: saved } = await api('/api/site', { data: site }, 'PUT');
      storage.clear();
      showLive(saved);
      setStatus(saved.live ? 'Saved · changes are live' : 'Saved', 'good');
      return true;
    } catch (err) {
      setStatus(`Not saved: ${err.message}`, 'warn');
      return false;
    }
  });
  return saving;
}
addEventListener('beforeunload', (e) => {
  if (loggedIn && statusEl.textContent === 'Unsaved changes') { save(); e.preventDefault(); }
});

function showLive(s) {
  published = !!s?.live;
  liveLink.hidden = !published;
  if (published) liveLink.href = s.url;
}

// ---------- Publishing (and paying first, once billing is on)
const go = async (path, body) => { location.href = (await api(path, body)).url; };
async function publish() {
  if (!loggedIn) {
    storage.set(site);
    location.href = '/signup?next=publish';
    return;
  }
  if (!(await save())) return;
  try {
    const res = await fetch('/api/publish', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"published":true}' });
    const data = await res.json();
    if (data.needsPayment) { plansDialog.showModal(); return; }
    if (!res.ok) throw new Error(data.error);
    showLive(data.site);
    setStatus('Published', 'good');
    const a = $('.live-link a', dialog);
    a.href = data.site.url;
    a.textContent = data.site.url;
    dialog.showModal();
  } catch (err) {
    setStatus(err.message, 'warn');
  }
}
plansDialog.querySelectorAll('[data-plan]').forEach((b) => b.addEventListener('click', async () => {
  plansDialog.querySelectorAll('[data-plan]').forEach((x) => { x.disabled = true; });
  try {
    await go('/api/billing/checkout', { plan: b.dataset.plan });
  } catch (err) {
    const e = $('.error', plansDialog);
    e.textContent = err.message;
    e.hidden = false;
    plansDialog.querySelectorAll('[data-plan]').forEach((x) => { x.disabled = false; });
  }
}));
$('[data-close]', plansDialog).addEventListener('click', () => plansDialog.close());
billingButton.addEventListener('click', () => go('/api/billing/portal').catch((err) => setStatus(err.message, 'warn')));
$('[data-publish]').addEventListener('click', publish);
$('[data-close]', dialog).addEventListener('click', () => dialog.close());
$('[data-copy]', dialog).addEventListener('click', async (e) => {
  try { await navigator.clipboard.writeText($('.live-link a', dialog).href); e.target.textContent = 'Copied!'; } catch { e.target.textContent = 'Select the link to copy it'; }
});
$('[data-unpublish]', dialog).addEventListener('click', async () => {
  const { site: s } = await api('/api/publish', { published: false });
  showLive(s);
  setStatus('Offline · only you can see it here', 'warn');
  dialog.close();
});

// ---------- Deleting the account
const deleteDialog = $('dialog.delete-account');
$('[data-delete-account]')?.addEventListener('click', () => deleteDialog.showModal());
$('[data-close]', deleteDialog).addEventListener('click', () => deleteDialog.close());
$('[data-confirm-delete]', deleteDialog).addEventListener('click', async (e) => {
  const err = $('.error', deleteDialog);
  err.hidden = true;
  e.target.disabled = true;
  try {
    await api('/api/account/delete', { password: deleteDialog.querySelector('[name=password]').value });
    storage.clear();
    location.href = '/';
  } catch (ex) {
    err.textContent = ex.message;
    err.hidden = false;
    e.target.disabled = false;
  }
});

// ---------- Phone/desktop toggle, and Edit/Preview tabs on small screens
document.querySelectorAll('[data-device]').forEach((b) => b.addEventListener('click', () => {
  if (b.tagName !== 'BUTTON') return;
  $('.frame').dataset.device = b.dataset.device;
  document.querySelectorAll('button[data-device]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
}));
document.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => {
  $('.builder').dataset.view = t.dataset.tab;
  document.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
}));

// ---------- Start: saved site > draft from before signing up > blank (with ?trade= from the landing page)
const me = await fetch('/api/me').then((r) => r.json()).catch(() => ({}));
const draft = storage.get();
billingButton.hidden = !(me.billing?.enabled && me.user?.hasBilling);
if (me.site) {
  site = { ...blank(me.site.data.trade), ...me.site.data };
  showLive(me.site);
  if (me.site.live) setStatus('Published', 'good');
  else if (me.site.published) setStatus('Offline: your plan isn’t active. Press Publish to pick one.', 'warn');
  else setStatus('Saved', 'good');
} else if (draft) {
  site = { ...blank(draft.trade), ...draft };
  if (!loggedIn) setStatus('Draft saved in this browser');
} else {
  site = blank(PRESETS[params.get('trade')] ? params.get('trade') : 'lawn care');
  if (!loggedIn) setStatus('Fill in your business. Nothing is shared until you publish.');
}
fillForm();
preview();
if (loggedIn && !me.site && draft) await save();
if (params.has('publish')) {
  history.replaceState(null, '', '/build');
  if (loggedIn) publish();
}
// Back from Stripe Checkout: Stripe tells our server about the payment a moment later, so wait for it, then publish
if (params.has('paid') && loggedIn) {
  history.replaceState(null, '', '/build');
  setStatus('Payment received. Publishing your site…');
  for (let i = 0; i < 20; i++) {
    const now = await fetch('/api/me').then((r) => r.json()).catch(() => ({}));
    if (now.user?.paying) { billingButton.hidden = false; await publish(); break; }
    if (i === 19) setStatus('Payment is still processing. Refresh in a minute, then press Publish.', 'warn');
    await new Promise((r) => setTimeout(r, 1500));
  }
}
