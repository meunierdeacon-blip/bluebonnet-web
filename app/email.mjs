// Sends email through Resend (resend.com, free for 3,000 emails a month). Without RESEND_API_KEY,
// the email is printed in the terminal instead, which is how password reset works on your laptop.
import { CONFIG } from './config.mjs';

export async function sendEmail({ to, subject, text }) {
  const { resendKey, from } = CONFIG.email;
  if (!resendKey || !from) {
    console.log(`\n--- Email (not sent: RESEND_API_KEY or EMAIL_FROM not set) ---\nTo: ${to}\nSubject: ${subject}\n\n${text}\n---\n`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${resendKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
}
