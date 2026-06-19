import type { FetchResponse, HttpClient } from "../core/http";
import type { Conversation, Message } from "../core/types";
import { uuidv4 } from "../core/util";

/** Parse a chunked `application/x-ndjson` stream into JSON objects, line by line. */
async function* ndjsonLines(
  res: FetchResponse,
): AsyncGenerator<{ event?: string; data?: Record<string, unknown> }> {
  const stream = res.body;
  if (!stream) return;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl = buf.indexOf("\n");
      while (nl >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (line) yield JSON.parse(line);
        nl = buf.indexOf("\n");
      }
    }
    const tail = buf.trim();
    if (tail) yield JSON.parse(tail);
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export interface StreamOptions {
  /** Abort the long-lived stream (e.g. `AbortController.abort()`). */
  signal?: AbortSignal;
}

export interface ReplyOptions {
  itemId: string;
  name: string;
  email: string;
  body: string;
  cc?: boolean;
}

/**
 * Messaging / chat. Live feeds are NDJSON-over-HTTP streams exposed as async
 * iterators (backlog first, then live updates); sends are plain POSTs.
 */
export class MessagingResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Live stream of conversations. Yields a full conversation object on every
   * change (initial backlog, then updates). Maintain your own map keyed by
   * `conversation.id`. Runs until the signal aborts or the server closes.
   */
  async *streamConversations(
    options: StreamOptions = {},
  ): AsyncGenerator<Conversation> {
    const res = await this.http.openStream(
      "GET",
      "/messaging/stream/conversations",
      {
        signal: options.signal,
      },
    );
    for await (const frame of ndjsonLines(res)) {
      for (const conv of Object.values(frame.data ?? {})) {
        yield conv as Conversation;
      }
    }
  }

  /**
   * Live stream of messages in a conversation. Yields backlog (from `offset`,
   * ordered by offset) then new messages as they arrive.
   */
  async *streamMessages(
    conversationId: string,
    options: StreamOptions & { offset?: number } = {},
  ): AsyncGenerator<Message> {
    const res = await this.http.openStream(
      "GET",
      `/messaging/stream/conversations/${conversationId}/messages`,
      { query: { offset: options.offset ?? 0 }, signal: options.signal },
    );
    for await (const frame of ndjsonLines(res)) {
      const batch = Object.values(frame.data ?? {}) as Message[];
      batch.sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
      for (const msg of batch) yield msg;
    }
  }

  /** Send a text message. Returns the created message (with server offset). */
  async send(conversationId: string, text: string): Promise<Message> {
    return (await this.http.request(
      "POST",
      `/messaging/conversations/${conversationId}/messages`,
      { body: { id: uuidv4(), type: "text", payload: text } },
    )) as Message;
  }

  /** Mark the conversation read up to (and including) `offset`. */
  async markRead(conversationId: string, offset: number): Promise<void> {
    await this.http.request(
      "POST",
      `/messaging/conversations/${conversationId}/receipt`,
      {
        body: { offset },
      },
    );
  }

  /**
   * Start a conversation by replying to a listing. Does NOT return a
   * conversation id — discover the new conversation via `streamConversations`.
   */
  async reply(
    options: ReplyOptions,
  ): Promise<{ message: string; publicAccountId: string }> {
    const form = new URLSearchParams({
      item_id: options.itemId,
      cc: String(options.cc ?? false),
      name: options.name,
      email: options.email,
      body: options.body,
    });
    return (await this.http.request("POST", "/item/reply.json", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body: form.toString(),
    })) as { message: string; publicAccountId: string };
  }
}
