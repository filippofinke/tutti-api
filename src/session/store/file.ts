import type { SessionSnapshot } from "../session";
import type { SessionStore } from "./store";

/** Persists each session as a JSON file in a directory (one file per key). */
export class FileSessionStore implements SessionStore {
  constructor(private readonly dir: string) {}

  async save(key: string, snapshot: SessionSnapshot): Promise<void> {
    const { mkdir, writeFile } = await import("node:fs/promises");
    await mkdir(this.dir, { recursive: true });
    await writeFile(
      await this.file(key),
      JSON.stringify(snapshot, null, 2),
      "utf8",
    );
  }

  async load(key: string): Promise<SessionSnapshot | null> {
    const { readFile } = await import("node:fs/promises");
    try {
      return JSON.parse(
        await readFile(await this.file(key), "utf8"),
      ) as SessionSnapshot;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    const { rm } = await import("node:fs/promises");
    await rm(await this.file(key), { force: true });
  }

  async keys(): Promise<string[]> {
    const { readdir } = await import("node:fs/promises");
    try {
      const files = await readdir(this.dir);
      return files
        .filter((f) => f.endsWith(".json"))
        .map((f) => decodeURIComponent(f.slice(0, -5)));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }

  private async file(key: string): Promise<string> {
    const { join } = await import("node:path");
    // encode so arbitrary keys map to safe, reversible filenames
    return join(this.dir, `${encodeURIComponent(key)}.json`);
  }
}
