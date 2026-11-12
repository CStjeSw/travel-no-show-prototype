# No-show prevention for trip-planning calls

A clickable concept prototype by Clara Stjernswärd. It shows how a travel company could cut no-shows for planning calls, where each call is booked days in advance with one named travel expert.

**Live demo:** https://cstjesw.github.io/travel-no-show-prototype/

> Fictional company and data. Not affiliated with any real company.

## What it shows

- **Customer:** a 24h SMS reminder with Confirm, Reschedule and I have a question, plus free text. A customer who asks to cancel can choose between cancelling and booking a new time.
- **AI handling:** the detected intent and confidence, then either an automatic answer or a handover to the travel expert whose destination skills (country or region) best match the trip.
- **Expert:** the incoming handover with a one-line AI summary, a suggested reply, reassignment and escalation.
- **Ops:** confirmation rate, no-show risk per booking, expert queue load, and freed slots with refill suggestions that a person confirms.

The prototype opens on a **Start here** page with a 60-second tour and four "Try this" scenarios. The **About** page covers the decisions and assumptions behind it, what's real and what's simulated, and how I'd measure and test it.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The travel prototype (main version) |
| `clinic-version/index.html` | An earlier version of the same flow for consultation clinics, in English and Swedish |

Each page is a single HTML file with no build step and no dependencies apart from Google Fonts. To run one locally, open it in a browser.

## Real vs simulated

- **Rule-based:** routing and match scoring, the rules for automatic answers vs handovers, the no-show risk score, the cancel-or-rebook flow and the freed-slot checks.
- **Simulated:** intent detection uses a keyword model in place of a language model. Summaries and suggested replies for the example messages are written in advance.
- **Mock:** all people, trips, prices, queues and history. Nothing is connected to SMS, Zoom or Zoom Contact Center, and nothing is saved between visits.

## Publish with GitHub Pages

1. Upload this folder's contents to a public repository.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and click **Save**.
4. After a minute or two the demo is live at `https://<your-username>.github.io/<repository-name>/`. The clinic version is at `.../clinic-version/`.
