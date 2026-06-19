/**
 * Demo: list conversations + stream messages (live).
 * Run:  npm run demo:session   (once, to store an authenticated session)
 *       npm run demo:messages
 *
 * Streams are long-lived, so this demo time-boxes each with an AbortController.
 */

import { loadClient } from "./demo-shared";
import type { Conversation, Message } from "./src/index";

async function collect<T>(
  gen: AsyncGenerator<T>,
  ms: number,
  ac: AbortController,
): Promise<T[]> {
  const out: T[] = [];
  const timer = setTimeout(() => ac.abort(), ms);
  try {
    for await (const item of gen) out.push(item);
  } catch (err) {
    const msg = String((err as Error)?.message ?? err);
    if ((err as Error)?.name !== "AbortError" && !/abort/i.test(msg)) throw err;
  } finally {
    clearTimeout(timer);
  }
  return out;
}

async function main(): Promise<void> {
  const client = await loadClient();
  if (!client.session.isAuthenticated) {
    console.error(
      "Messaging needs an authenticated session — run `npm run demo:session` first.",
    );
    process.exit(1);
  }
  const me = client.session.auth?.accountId;

  console.log("Streaming conversations (3s)…");
  const ac1 = new AbortController();
  const convs = await collect<Conversation>(
    client.messaging.streamConversations({ signal: ac1.signal }),
    3000,
    ac1,
  );
  const byId = new Map(convs.map((c) => [c.id, c]));
  for (const c of byId.values()) {
    console.log(
      `• ${c.id}  [${c.item?.subject ?? "?"}]  last: ${c.latestMessage?.content?.text ?? ""}`,
    );
  }

  const first = byId.values().next().value as Conversation | undefined;
  if (!first) {
    console.log("\nNo conversations.");
    return;
  }

  console.log(`\nMessages in ${first.id} (3s)…`);
  const ac2 = new AbortController();
  const msgs = await collect<Message>(
    client.messaging.streamMessages(first.id, { signal: ac2.signal }),
    3000,
    ac2,
  );
  for (const m of msgs) {
    const who = m.senderPublicAccountId === me ? "→ me " : "←    ";
    console.log(`  ${who} [#${m.offset}] ${m.content?.text ?? ""}`);
  }

  // To send a reply:  await client.messaging.send(first.id, "Hello!");
  // To mark read:     await client.messaging.markRead(first.id, lastOffset);
}

main().catch((err) => {
  console.error("Messaging demo failed:", err);
  process.exit(1);
});
