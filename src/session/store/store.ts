import type { SessionSnapshot } from "../session";

/**
 * Persists session snapshots under a string key. Implementations are
 * interchangeable (in-memory, file, Redis, …) so callers depend on this
 * interface, never a concrete store.
 *
 * Works with plain {@link SessionSnapshot} JSON (from `session.toJSON()`), not
 * the `Session` class — keeping persistence decoupled from the client.
 */
export interface SessionStore {
  /** Create or overwrite the snapshot stored under `key`. */
  save(key: string, snapshot: SessionSnapshot): Promise<void>;
  /** Return the snapshot for `key`, or null if none. */
  load(key: string): Promise<SessionSnapshot | null>;
  /** Remove the snapshot for `key` (no-op if absent). */
  delete(key: string): Promise<void>;
  /** List all stored keys. */
  keys(): Promise<string[]>;
}
