# No-show prevention for trip-planning calls

A clickable concept prototype. It shows how a travel company could cut no-shows for planning calls, where each call is booked days in advance with one named travel expert.

**Live demo:** https://cstjesw.github.io/travel-no-show-prototype/

> Fictional company and data. Not affiliated with any real company.

## What it shows

- **Customer:** a 24h SMS reminder with Confirm, Reschedule and I have a question, plus free text. A customer who asks to cancel can choose between cancelling and booking a new time.
- **AI handling:** how each reply was read (intent, language, new destinations, warning flags, confidence) and the fixed rules that then choose between an automatic answer and a handover to the travel expert whose destination skills best match the trip.
- **Expert:** the incoming handover with a one-line AI summary, a suggested reply, reassignment and escalation.
- **Ops:** confirmation rate, no-show risk per booking, expert queue load, and freed slots with refill suggestions that a person confirms.
- **Evals:** 89 hand-labelled customer replies scored for outcome, not only label accuracy: wrong automatic answers, unneeded handovers, results per message type and a confidence-threshold sweep.

The prototype opens on a **Start here** page with a 60-second tour, four scenarios and a set of hard messages to try. The **About** page covers the decisions and assumptions behind it, what's real and what's simulated, and how I'd measure and test it.

## How the AI part works

The model reads, the rules decide.

1. The browser sends the customer's text and a little booking context to a small Cloudflare Worker (`worker/worker.js`). The prompt, the output schema and the API key live there, not in the page.
2. Claude returns a structured reading through a forced tool call. The Worker checks every field against fixed lists before returning it.
3. `decide()` in `index.html` takes the reading and applies fixed rules. A template goes out only for a clear confirm, reschedule, cancel or "how do I join" in English, above the confidence threshold, with no new destination and no warning flag. Everything else goes to a person.
4. If the model is slow, down or not connected, the keyword model takes over and the screen says so.

The customer's text is passed to the model as data, not instructions. Draft replies for experts must use a [placeholder] for any price, refund term or visa rule.

## Evaluation

| File | What it is |
| --- | --- |
| `evals/dataset.js` | 89 messages with expected intent, destinations and outcome, plus the labelling rules |
| `evals/run.mjs` | Sends every message through the Worker code and saves the raw readings |
| `evals/results.js` | The saved run. Empty until the runner has been run |

Scoring happens on the Evals page, with the same `decide()` the live flow uses, so the numbers always reflect the current rules.

Keyword baseline at the 85% threshold: 64 of 89 handled correctly, 2 wrong automatic answers, and 23 of the 31 template-ready messages sent to an expert anyway. It is safe mostly because it rarely acts: at an 80% threshold it sends 8 wrong automatic answers.

To run the model on the same set:

```
ANTHROPIC_API_KEY=sk-ant-... node evals/run.mjs
```

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The travel prototype (main version) |
| `worker/worker.js` | Cloudflare Worker: prompt, schema, validation, origin lock, rate limit |
| `evals/` | Test set, runner and saved results |
| `DEPLOY.md` | How to connect the live model |
| `clinic-version/index.html` | An earlier version of the same flow for consultation clinics, in English and Swedish |

The page has no build step and no dependencies apart from Google Fonts. To run it locally, open `index.html` in a browser.

## Real vs simulated

- **Rule-based:** routing and match scoring, the rules for automatic answers vs handovers, the no-show risk score, the cancel-or-rebook flow and the freed-slot checks.
- **AI:** new free-text replies are read by Claude through the Worker once `LLM_ENDPOINT` is set in `index.html`; otherwise by the keyword fallback. The ten seeded replies carry curated readings, summaries and suggested replies so the tour is stable.
- **Mock:** all people, trips, prices, queues and history. Nothing is connected to SMS, Zoom or Zoom Contact Center, and nothing is saved between visits.

## Publish with GitHub Pages

1. Upload this folder's contents to a public repository.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and click **Save**.
4. After a minute or two the demo is live at `https://<your-username>.github.io/<repository-name>/`. The clinic version is at `.../clinic-version/`.
