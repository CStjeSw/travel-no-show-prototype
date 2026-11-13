# Connect the live model

About ten minutes. You need an Anthropic API key and a free Cloudflare account.

## 1. Get an API key and cap the spend

1. In the Anthropic Console, create an API key.
2. Set a low monthly spend limit for the workspace. This is the hard stop if the demo link is shared widely. One message costs a fraction of a cent.

## 2. Deploy the Worker

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Worker**. Name it, for example, `no-show-reader`, and deploy the default code.
2. Click **Edit code**, replace everything with the contents of `worker/worker.js`, and deploy.
3. Under **Settings → Variables and Secrets**, add:
   - `ANTHROPIC_API_KEY` as a **Secret**: your key
   - `ALLOWED_ORIGINS` as text: `https://cstjesw.github.io`
   - `MODEL` (optional): the model ID to use. The default is set at the top of `worker.js`; check Anthropic's model list for the current small, fast model.
4. Copy the Worker URL, for example `https://no-show-reader.<your-subdomain>.workers.dev`.

## 3. Point the page at it

In `index.html`, set:

```js
const LLM_ENDPOINT = 'https://no-show-reader.<your-subdomain>.workers.dev';
```

Commit and push. On the live page, the Start page chip should read "Read live by Claude", and a typed reply should show "Read by Claude" on the AI handling screen.

## 4. Run the evaluation

```
ANTHROPIC_API_KEY=sk-ant-... node evals/run.mjs
```

This writes `evals/results.js`. Commit it, and the Evals page fills in the Claude column. Re-run it whenever the prompt in `worker.js` changes, and bump `PROMPT_VERSION`.

## What protects the endpoint

- The prompt and schema are fixed in the Worker, so it only reads one short customer message.
- Requests from other websites are refused (`ALLOWED_ORIGINS`).
- Messages over 500 characters are refused and output is capped at 600 tokens.
- A best-effort limit of 20 requests a minute per IP. For a stricter limit, add a Cloudflare rate limiting rule on the Worker route.
- The spend limit from step 1.
