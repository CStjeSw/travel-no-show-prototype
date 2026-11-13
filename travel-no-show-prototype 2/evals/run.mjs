// Runs every message in dataset.js through the same Worker code that serves the live demo,
// and saves the raw readings to results.js. The Evals screen in index.html does the scoring.
//
//   ANTHROPIC_API_KEY=sk-ant-... node evals/run.mjs
//   MODEL=claude-haiku-4-5 ANTHROPIC_API_KEY=... node evals/run.mjs      (optional model override)

import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import worker from '../worker/worker.js';

const require = createRequire(import.meta.url);
const SET = require('./dataset.js');

// Booking context, mirroring the fields index.html sends. Kept in step with SEED in index.html.
const BOOKINGS = {
  'B-3101': { first: 'Emma', dests: ['thailand'], trip: 'Honeymoon · 12 nights · Phuket & Krabi', time: '08:30', expert: 'Niran' },
  'B-3102': { first: 'Daniel', dests: ['italy', 'france'], trip: 'Rail trip · 10 nights · Rome to Paris', time: '09:15', expert: 'Marco' },
  'B-3103': { first: 'Aisha', dests: ['vietnam'], trip: 'Family trip · 2 weeks · Hanoi to Hoi An', time: '10:00', expert: 'Mai' },
  'B-3104': { first: 'Ben', dests: ['australia'], trip: 'Road trip · 3 weeks · Sydney to Cairns', time: '10:45', expert: 'Chloe' },
  'B-3105': { first: 'Megan', dests: ['uk'], trip: 'Scottish Highlands · 7 nights · self-drive', time: '11:30', expert: 'Olivia' },
  'B-3106': { first: 'Oliver', dests: ['sweden'], trip: 'Northern lights · 6 nights · Swedish Lapland', time: '13:00', expert: 'Ingrid' },
  'B-3107': { first: 'Grace', dests: ['thailand'], trip: 'Island hopping · 2 weeks · Bangkok & Koh Samui', time: '13:45', expert: 'Niran' },
  'B-3108': { first: 'Michael', dests: ['germany'], trip: 'Christmas markets · 5 nights · Munich & Nuremberg', time: '14:30', expert: 'Hanna' },
  'B-3109': { first: 'Hannah', dests: ['australia'], trip: 'Visiting family · 4 weeks · Perth & Melbourne', time: '15:15', expert: 'Jack' },
  'B-3110': { first: 'Samuel', dests: ['france'], trip: 'Provence & Paris · 9 nights', time: '16:00', expert: 'Marco' },
};

if (!process.env.ANTHROPIC_API_KEY) { console.error('Set ANTHROPIC_API_KEY first.'); process.exit(1); }
const env = { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY, MODEL: process.env.MODEL, LOCAL_EVAL: '1' };

async function read(item, attempt = 1) {
  const req = new Request('http://local/eval', { method: 'POST', body: JSON.stringify({ text: item.text, booking: BOOKINGS[item.b] }) });
  const out = await (await worker.fetch(req, env)).json();
  if (!out.ok && attempt < 3) { await new Promise(r => setTimeout(r, 1500 * attempt)); return read(item, attempt + 1); }
  return out;
}

const items = {}; let model = '', promptVersion = '', failed = 0;
const queue = [...SET];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let item; (item = queue.shift());) {
    const out = await read(item);
    if (out.ok) { items[item.id] = { ...out.result, ms: out.ms }; model = out.model; promptVersion = out.prompt_version; }
    else { failed++; console.error(`${item.id}: ${out.error}`); }
    process.stdout.write(`\r${Object.keys(items).length + failed}/${SET.length}`);
  }
}));

const file = fileURLToPath(new URL('./results.js', import.meta.url));
const payload = { model, prompt_version: promptVersion, run_at: new Date().toISOString().slice(0, 10), items };
writeFileSync(file, `// Written by \`node evals/run.mjs\`. Holds the raw LLM reading for every item in dataset.js.
// Scoring happens in the Evals screen of index.html, with the same decide() rules the live flow uses.
window.EVAL_RESULTS = ${JSON.stringify(payload, null, 1)};
`);
console.log(`\nSaved ${Object.keys(items).length} readings from ${model} to evals/results.js${failed ? ` (${failed} failed)` : ''}. Open index.html#evals to see the scores.`);
