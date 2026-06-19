/**
 * Store a session that the other demos load.
 * Two ways:
 *   A) bring a token:   TUTTI_TOKEN=<X-Tutti-Auth> npm run demo:session
 *   B) full login:      GEMINI_API_KEY=… TUTTI_USER=… TUTTI_PASS=… npm run demo:session
 *
 * Saved via FileSessionStore to ./.tutti-sessions/<key>.json (key = TUTTI_SESSION or "default").
 */

import { SESSION_KEY, store } from "./demo-shared";
import { LLMCaptchaProvider, TuttiClient } from "./src/index";

async function main(): Promise<void> {
  const client = new TuttiClient();

  if (process.env.TUTTI_TOKEN) {
    client.account.useToken(
      process.env.TUTTI_TOKEN,
      process.env.TUTTI_ACCOUNT_ID,
    );
    console.log("Using provided TUTTI_TOKEN.");
  } else if (process.env.TUTTI_USER && process.env.TUTTI_PASS) {
    console.log("Logging in (captcha solved via Gemini)…");
    const account = await client.account.login({
      username: process.env.TUTTI_USER,
      password: process.env.TUTTI_PASS,
      captcha: new LLMCaptchaProvider(),
    });
    console.log(`Logged in ✓ account ${account.publicAccountId}`);
  } else {
    console.error(
      "Provide TUTTI_TOKEN, or TUTTI_USER + TUTTI_PASS (+ GEMINI_API_KEY) to log in.",
    );
    process.exit(1);
  }

  await store.save(SESSION_KEY, client.session.toJSON());
  console.log(
    `\nSaved session "${SESSION_KEY}". Stored keys: ${JSON.stringify(await store.keys())}`,
  );
  console.log(
    "Other demos will now load it (e.g. `npm run demo:queries`, `npm run demo:messages`).",
  );
}

main().catch((err) => {
  console.error("Session demo failed:", err);
  process.exit(1);
});
