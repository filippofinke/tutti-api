/**
 * Shared bits for the demos: one on-disk session store that `demo-session.ts`
 * writes to and every other demo reads from.
 */
import { FileSessionStore, Session, TuttiClient } from "./src/index";

export const SESSION_DIR = "./.tutti-sessions";
export const SESSION_KEY = process.env.TUTTI_SESSION ?? "default";
export const store = new FileSessionStore(SESSION_DIR);

/**
 * Build a client from the stored session. Falls back to an anonymous client
 * (with a hint) if none is saved — unauthenticated calls still work.
 */
export async function loadClient(): Promise<TuttiClient> {
  const snapshot = await store.load(SESSION_KEY);
  if (!snapshot) {
    console.warn(
      `[demo] no stored session "${SESSION_KEY}". Run \`npm run demo:session\` first. Using an anonymous session.\n`,
    );
    return new TuttiClient();
  }
  const client = new TuttiClient({ session: Session.fromJSON(snapshot) });
  const who = client.session.auth?.accountId;
  console.log(
    `[demo] loaded session "${SESSION_KEY}"${who ? ` (account ${who})` : ""}\n`,
  );
  return client;
}
