import { uuidv4 } from "../core/util";

/** App identity headers. Defaults mirror a captured tutti Android client. */
export interface AppConfig {
  version: string; // X-App-Version
  source: string; // X-Tutti-Source
  clientId: string; // X-Tutti-Client-Identifier
  appId: string; // X-App-Id
  userAgent: string; // User-Agent (WAF checks this — Node's default UA is blocked)
}

/** Authenticated-account state. Empty for anonymous sessions (v1). This is the
 *  seam for future login: populate it and every subsequent request is authed. */
export interface AuthState {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
  accountId?: string;
}

export interface SessionSnapshot {
  tuttiHash: string;
  app: AppConfig;
  language: string;
  auth?: AuthState;
}

export interface SessionOptions {
  /** Per-install device hash. Pass a saved one to pin an account; else random. */
  tuttiHash?: string;
  app?: Partial<AppConfig>;
  language?: string;
  auth?: AuthState;
}

const DEFAULT_APP: AppConfig = {
  version: "Tutti/11.0.0(40011774)/Android/36",
  source: "Android 11.0.0 (40011774)",
  clientId: "android/11.0.0+env-live.git-a9330101d",
  appId: "",
  userAgent: "ch.tutti/android (Google Pixel 7a, OS 16)",
};

/** Per-account state and the single source of request headers. One Session =
 *  one account; construct several for several accounts. */
export class Session {
  tuttiHash: string;
  app: AppConfig;
  language: string;
  auth?: AuthState;

  constructor(opts: SessionOptions = {}) {
    this.tuttiHash = opts.tuttiHash ?? uuidv4();
    this.app = { ...DEFAULT_APP, ...opts.app };
    this.language = opts.language ?? "de";
    this.auth = opts.auth;
  }

  /** Headers for every request. Called per request so auth changes apply at once. */
  buildHeaders(): Record<string, string> {
    return {
      "X-Tutti-Hash": this.tuttiHash,
      "X-Tutti-Source": this.app.source,
      "X-Tutti-Client-Identifier": this.app.clientId,
      "X-App-Version": this.app.version,
      "X-App-Id": this.app.appId,
      "User-Agent": this.app.userAgent,
      "Accept-Language": this.language,
      ...this.authHeaders(),
    };
  }

  /** Tutti authenticates with the session token in `X-Tutti-Auth` (NOT a Bearer
   *  header — that is only used once, to mint this token via authenticateJWT). */
  protected authHeaders(): Record<string, string> {
    return this.auth?.token ? { "X-Tutti-Auth": this.auth.token } : {};
  }

  setAuth(auth: AuthState): void {
    this.auth = auth;
  }
  clearAuth(): void {
    this.auth = undefined;
  }
  get isAuthenticated(): boolean {
    return Boolean(this.auth?.token);
  }

  /** Persist a (possibly logged-in) account; restore with `Session.fromJSON`. */
  toJSON(): SessionSnapshot {
    return {
      tuttiHash: this.tuttiHash,
      app: this.app,
      language: this.language,
      auth: this.auth,
    };
  }
  static fromJSON(s: SessionSnapshot): Session {
    return new Session({
      tuttiHash: s.tuttiHash,
      app: s.app,
      language: s.language,
      auth: s.auth,
    });
  }
}
