import type { Session } from "../session/session";
import { TuttiHttpError, TuttiNetworkError } from "./errors";

export interface FetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
  /** Present for streaming responses (NDJSON). */
  body?: ReadableStream<Uint8Array> | null;
}

/** Minimal fetch shape the client relies on (the global `fetch` satisfies it). */
export type FetchLike = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
) => Promise<FetchResponse>;

export interface HttpClientOptions {
  baseURL: string; // e.g. https://api.tutti.ch
  apiVersion: string; // e.g. v10
  session: Session;
  fetch: FetchLike;
}

export interface RequestInit {
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

/** Protocol-agnostic HTTP layer: applies session headers (per request, so
 *  auth set/refreshed mid-life takes effect immediately), JSON encodes bodies,
 *  and maps failures to typed errors. Shared by GraphQL, REST, and streaming. */
export class HttpClient {
  constructor(private readonly opts: HttpClientOptions) {}

  /** Send a request and parse the JSON body (or undefined if empty). */
  async request(
    method: string,
    path: string,
    init: RequestInit = {},
  ): Promise<unknown> {
    const res = await this.send(method, path, init);
    const text = await res.text();
    if (!res.ok) throw new TuttiHttpError(res.status, res.statusText, text);
    return text ? JSON.parse(text) : undefined;
  }

  /** Open a (possibly long-lived) response without buffering the body — for
   *  streaming endpoints. Caller consumes `response.body`. */
  async openStream(
    method: string,
    path: string,
    init: RequestInit = {},
  ): Promise<FetchResponse> {
    const res = await this.send(method, path, init);
    if (!res.ok)
      throw new TuttiHttpError(res.status, res.statusText, await res.text());
    return res;
  }

  private async send(
    method: string,
    path: string,
    init: RequestInit,
  ): Promise<FetchResponse> {
    const { session, fetch } = this.opts;
    const headers: Record<string, string> = {
      ...session.buildHeaders(),
      ...init.headers,
    };
    let body: string | undefined;
    if (typeof init.body === "string") {
      // Pre-encoded body (e.g. form-urlencoded); caller sets Content-Type.
      body = init.body;
    } else if (init.body !== undefined) {
      headers["Content-Type"] = "application/json; charset=utf-8";
      body = JSON.stringify(init.body);
    }
    try {
      return await fetch(this.buildUrl(path, init.query), {
        method,
        headers,
        body,
        signal: init.signal,
      });
    } catch (cause) {
      throw new TuttiNetworkError(cause);
    }
  }

  private buildUrl(path: string, query?: RequestInit["query"]): string {
    let url = `${this.opts.baseURL}/${this.opts.apiVersion}${path}`;
    if (query) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) qs.set(k, String(v));
      }
      const s = qs.toString();
      if (s) url += `?${s}`;
    }
    return url;
  }
}
