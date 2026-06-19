/** Minimal cookie jar for the Auth0 login flow (single host, no path/expiry
 *  logic — just enough to carry session + Cloudflare cookies across redirects). */
export class CookieJar {
  private readonly jar = new Map<string, string>();

  storeFromResponse(res: { headers: Headers }): void {
    const headers = res.headers as Headers & { getSetCookie?: () => string[] };
    const cookies =
      typeof headers.getSetCookie === "function"
        ? headers.getSetCookie()
        : headers.get("set-cookie")
          ? [headers.get("set-cookie") as string]
          : [];
    for (const raw of cookies) {
      const pair = raw.split(";", 1)[0];
      const eq = pair.indexOf("=");
      if (eq > 0)
        this.jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }

  /** `Cookie` header value, or empty string if the jar is empty. */
  header(): string {
    return Array.from(this.jar, ([k, v]) => `${k}=${v}`).join("; ");
  }
}
