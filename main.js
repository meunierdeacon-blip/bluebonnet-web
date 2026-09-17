// Website check scoring, plan preselect, and the quote form (opens the visitor's email app).
const BASE = document.documentElement.dataset.base || '';
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

document.querySelectorAll('[data-quiz]').forEach((quiz) => {
  const boxes = [...quiz.querySelectorAll('input')];
  const bar = quiz.querySelector('.meter i');
  const verdict = quiz.querySelector('.verdict');
  quiz.addEventListener('change', () => {
    const n = boxes.filter((b) => b.checked).length;
    const total = boxes.length;
    bar.style.width = `${(n / total) * 100}%`;
    bar.style.background = n >= total - 1 ? 'var(--good)' : 'var(--warn)';
    verdict.innerHTML = n >= total - 1
      ? `${n}/${total}. Your site is in good shape. A Care Plan can keep it that way.`
      : n >= total / 2
        ? `${n}/${total}. Customers are probably slipping through the cracks. <a href="${BASE}/contact/">Get a free quote</a> to fix the gaps.`
        : `${n}/${total}. Your site is likely sending customers to competitors. <a href="${BASE}/contact/">Let’s fix that</a>.`;
  });
});

document.querySelectorAll('form.quote').forEach((form) => {
  const plan = new URLSearchParams(location.search).get('plan');
  if (plan && form.plan.querySelector(`option[value="${CSS.escape(plan)}"]`)) form.plan.value = plan;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = form.querySelector('.form-note');
    const to = form.dataset.email;
    if (!to) {
      note.textContent = 'This form isn’t connected yet. Add an email to src/site.mjs and rebuild.';
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const planName = form.plan.selectedOptions[0].textContent;
    const body = `Name: ${d.name}\nBusiness: ${d.business}\nEmail: ${d.email}\nWebsite: ${d.website || 'none'}\nInterested in: ${planName}\n\n${d.details}`;
    location.href = `mailto:${to}?subject=${encodeURIComponent(`Website quote: ${d.business}`)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Your email app should open with your message ready. Just hit send.';
  });
});
