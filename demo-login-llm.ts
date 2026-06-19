/**
 * Demo: log in with the captcha solved automatically by Google Gemini (vision).
 * Run:
 *   GEMINI_API_KEY=… TUTTI_USER=you@example.com TUTTI_PASS=secret npm run demo:login:llm
 *
 * LLMCaptchaProvider reads GEMINI_API_KEY from the environment (no key in code).
 */

import { SESSION_KEY, store } from "./demo-shared";
import { LLMCaptchaProvider, TuttiClient } from "./src/index";

async function main(): Promise<void> {
  const username = process.env.TUTTI_USER;
  const password = process.env.TUTTI_PASS;
  if (!process.env.GEMINI_API_KEY) {
    console.error("Set GEMINI_API_KEY (used by LLMCaptchaProvider).");
    process.exit(1);
  }
  if (!username || !password) {
    console.error("Set TUTTI_USER and TUTTI_PASS environment variables.");
    process.exit(1);
  }

  const client = new TuttiClient();

  console.log("Logging in… the captcha is solved automatically via Gemini.\n");
  const account = await client.account.login({
    username,
    password,
    captcha: new LLMCaptchaProvider(),
  });

  console.log(`Logged in ✓  account ${account.publicAccountId}`);

  await store.save(SESSION_KEY, client.session.toJSON());
  console.log(`Session saved as "${SESSION_KEY}" — other demos will load it.`);

  const res = await client.search("ubiquiti").fetch();
  console.log(`\nAuthenticated search "ubiquiti": ${res.totalCount} matches`);
}

main().catch((err) => {
  console.error("Login demo failed:", err);
  process.exit(1);
});
