import type { SessionSnapshot } from "../session";
import type { SessionStore } from "./store";

/** Volatile, process-local store. Good for tests and short-lived processes. */
export class InMemorySessionStore implements SessionStore {
  private readonly map = new Map<string, SessionSnapshot>();

  async save(key: string, snapshot: SessionSnapshot): Promise<void> {
    this.map.set(key, structuredClone(snapshot));
  }
  async load(key: string): Promise<SessionSnapshot | null> {
    const s = this.map.get(key);
    return s ? structuredClone(s) : null;
  }
  async delete(key: string): Promise<void> {
    this.map.delete(key);
  }
  async keys(): Promise<string[]> {
    return [...this.map.keys()];
  }
}
