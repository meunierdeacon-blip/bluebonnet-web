// Writes PITCHES.md: a ready-to-send text message and follow-up for every lead whose status is "mockup made".
// Run after making mockups:  node mockup.mjs leads/leads.csv --shot  →  mark rows "mockup made"  →  node scripts/pitches.mjs
// PITCHES.md contains prospects' phone numbers, so it's git-ignored.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/site.mjs';

// Who signs the messages. Change this if you go by something else, or if Ethan is sending them.
const SIGNER = 'Deacon';
import { INDUSTRIES } from '../src/industries.mjs';
import { slugify } from '../mockup/render.mjs';
import { parseCsv } from '../mockup/csv.mjs';

const priorityOf = (r) => Number((r.notes || '').match(/PRIORITY (\d)/)?.[1] || 9);
const reviewCount = (r) => Number((r.notes || '').match(/stars \/ (\d+)/)?.[1] || 0);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const live = SITE.url.replace(/^https?:\/\//, '');
const leads = parseCsv(readFileSync(join(root, 'leads/leads.csv'), 'utf8')).filter((r) => r.status === 'mockup made')
  // Best first: PRIORITY number from notes, then most reviews
  .sort((x, y) => priorityOf(x) - priorityOf(y) || reviewCount(y) - reviewCount(x));

// "PRIORITY 1: 4.9 stars / 119 reviews" → only mention reviews when there are enough to be a compliment
const reviewsOf = (notes) => {
  const m = notes.match(/([\d.]+) stars \/ (\d+)/);
  return m && Number(m[2]) >= 9 ? { stars: m[1], count: m[2] } : null;
};

let out = `# Ready-to-send pitches (updated ${new Date().toISOString().slice(0, 10)})

Each business below was verified the same day it was added: found on Google Maps, phone cross-checked against another listing, and no website found anywhere. Every one has a demo in \`mockups/<folder>/\`.

**Sending a screenshot?** Attach \`phone.png\` from their folder. The messages below don't mention a screenshot, so they work either way.

**Your live site:** https://${live}/ (quote requests go to ${SITE.email || 'the email in src/site.mjs'})

**How to send:** from your own phone, during business hours (weekdays 9–5). Calling works better than texting for these: some business numbers are landlines or answering services that can't receive texts. Send one at a time, not a group message. If someone says no or asks you to stop, mark them \`lost\` in \`leads/leads.csv\` and don't contact them again.

**After sending:** set \`status\` to \`contacted\` and fill in the \`contacted\` date. Follow up once 3–4 days later, then stop.

**Phone script:** "Hi, is this the owner? I'm ${SIGNER}, I build websites for local businesses around Austin. I noticed you've got great reviews but no website, so I put together a free sample of what one could look like. Can I text or email it to you? No cost, no pressure."

---
`;

leads.forEach((r, i) => {
  const rv = reviewsOf(r.notes || '');
  const ind = INDUSTRIES.find((x) => x.trade === r.trade);
  const opener = rv
    ? `Hi! I came across ${r.name} on Google Maps. ${rv.count} reviews at ${rv.stars} stars is awesome, but I couldn't find a website for you.`
    : `Hi! I came across ${r.name} on Google Maps and noticed you don't have a website yet.`;
  const proof = `Here's a real one we built: waterlineweeds.co${ind ? `, and more about what we do for ${ind.plural}: ${live}/websites-for/${ind.slug}/` : ''}`;
  out += `
## ${i + 1}. ${r.name} (${r.trade}, ${r.town})
- **Phone:** ${r.phone} · **Reach by:** ${r.contact}
- **Demo:** \`mockups/${slugify(r.name)}/\` · **Notes:** ${r.notes}

> ${opener} I'm ${SIGNER}. My partner and I build simple websites for local businesses so people searching Google can find you and book. I'd be happy to make you a free sample of what yours could look like. ${proof} Happy to chat if you're interested, and no worries if not!

**Follow-up (3–4 days later, only if no reply):**
> Hi, just following up on my message about a website for ${r.name}. Want me to put together that free sample, or send over pricing? If not, no worries. I won't message again.
`;
});

writeFileSync(join(root, 'PITCHES.md'), out);
console.log(`PITCHES.md: ${leads.length} pitch(es) for leads marked "mockup made".`);
