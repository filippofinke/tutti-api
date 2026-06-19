import { TuttiAuthError } from "../core/errors";
import { type CaptchaProvider, parseDataUri } from "./captcha";
import { CookieJar } from "./cookies";
import { generatePkce, randomString } from "./pkce";

/** Full `fetch` (headers + manual redirect). The global fetch satisfies this. */
export type RawFetch = typeof fetch;

/** Auth0 / OAuth parameters. Defaults mirror the captured tutti Android client. */
export interface OAuthConfig {
  authBaseURL: string; // https://auth.tutti.ch
  clientId: string;
  redirectUri: string;
  audience: string;
  scope: string;
  uiLocales?: string;
}

export const DEFAULT_OAUTH: OAuthConfig = {
  authBaseURL: "https://auth.tutti.ch",
  clientId: "lykoMeGKh14siOyOVev0QBAB8vsSKV7b",
  redirectUri: "ch.tutti://auth.tutti.ch/android/ch.tutti/callback",
  audience: "https://api.tutti.ch",
  scope: "openid profile email",
  uiLocales: "en",
};

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface OAuthTokens {
  accessToken: string;
  idToken?: string;
  tokenType: string;
  expiresIn: number;
  scope?: string;
}

// Identifies the Auth0 Android SDK; some endpoints expect it.
const AUTH0_CLIENT =
  "eyJuYW1lIjoiQXV0aDAuQW5kcm9pZCIsImVudiI6eyJhbmRyb2lkIjoiMzYifSwidmVyc2lvbiI6IjMuMTAuMCJ9";
const BROWSER_UA =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36";
const HTML_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7";

function locationOf(res: Response): string {
  const loc = res.headers.get("location");
  if (!loc) {
    throw new TuttiAuthError(
      `expected a redirect but got HTTP ${res.status} with no Location`,
    );
  }
  return loc;
}

/**
 * Drive the Auth0 authorization-code + PKCE login headlessly: start the flow,
 * fetch the hosted login page, solve its captcha via the provider, submit
 * credentials, follow the redirects to the authorization code, and exchange it
 * for tokens. Returns the OAuth tokens (the access_token is then traded for a
 * tutti session via /account/authenticateJWT).
 */
export async function runLoginFlow(opts: {
  credentials: LoginCredentials;
  captcha: CaptchaProvider;
  config: OAuthConfig;
  fetch: RawFetch;
}): Promise<OAuthTokens> {
  const { credentials, captcha, config, fetch } = opts;
  const jar = new CookieJar();
  const base = config.authBaseURL;

  const htmlHeaders = (
    extra: Record<string, string> = {},
  ): Record<string, string> => ({
    "User-Agent": BROWSER_UA,
    Accept: HTML_ACCEPT,
    "Accept-Language": "en-US,en;q=0.9",
    ...(jar.header() ? { Cookie: jar.header() } : {}),
    ...extra,
  });

  // 1. /authorize — start the flow (PKCE + state + nonce).
  const pkce = await generatePkce();
  const state = randomString(32);
  const nonce = randomString(32);
  const authorizeUrl = new URL("/authorize", base);
  authorizeUrl.search = new URLSearchParams({
    audience: config.audience,
    scope: config.scope,
    response_type: "code",
    code_challenge: pkce.challenge,
    code_challenge_method: "S256",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    state,
    nonce,
    auth0Client: AUTH0_CLIENT,
    ...(config.uiLocales ? { ui_locales: config.uiLocales } : {}),
  }).toString();

  let res = await fetch(authorizeUrl.toString(), {
    method: "GET",
    redirect: "manual",
    headers: htmlHeaders({ Referer: "android-app://ch.tutti/" }),
  });
  jar.storeFromResponse(res);
  const loginUrl = new URL(locationOf(res), base); // /u/login?state=<blob>

  // 2. GET the hosted login page (contains the captcha + form state).
  res = await fetch(loginUrl.toString(), {
    method: "GET",
    redirect: "manual",
    headers: htmlHeaders({ Referer: "android-app://ch.tutti/" }),
  });
  jar.storeFromResponse(res);
  const html = await res.text();

  const imgMatch = /<img[^>]*alt="captcha"[^>]*src="(data:[^"]+)"/i.exec(html);
  if (!imgMatch) {
    throw new TuttiAuthError(
      "no captcha image found on the login page (layout may have changed)",
    );
  }
  const formState =
    /name="state"[^>]*value="([^"]*)"/i.exec(html)?.[1] ??
    /value="([^"]*)"[^>]*name="state"/i.exec(html)?.[1] ??
    loginUrl.searchParams.get("state") ??
    "";

  // 3. Solve the captcha via the (swappable) provider.
  const captchaSolution = await captcha.solve(parseDataUri(imgMatch[1]));

  // 4. POST credentials + captcha.
  res = await fetch(loginUrl.toString(), {
    method: "POST",
    redirect: "manual",
    headers: htmlHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: base,
      Referer: loginUrl.toString(),
    }),
    body: new URLSearchParams({
      state: formState,
      username: credentials.username,
      password: credentials.password,
      captcha: captchaSolution,
    }).toString(),
  });
  jar.storeFromResponse(res);
  const afterLogin = new URL(locationOf(res), base);
  if (!afterLogin.pathname.includes("/authorize/resume")) {
    throw new TuttiAuthError(
      `login rejected (wrong credentials or captcha). Redirected to ${afterLogin.pathname}`,
    );
  }

  // 5. /authorize/resume — yields the authorization code (custom-scheme redirect).
  res = await fetch(afterLogin.toString(), {
    method: "GET",
    redirect: "manual",
    headers: htmlHeaders({ Referer: loginUrl.toString() }),
  });
  jar.storeFromResponse(res);
  const callback = new URL(locationOf(res)); // ch.tutti://...callback?code=...&state=...
  const code = callback.searchParams.get("code");
  if (!code)
    throw new TuttiAuthError(
      "authorization code missing from callback redirect",
    );
  if (callback.searchParams.get("state") !== state) {
    throw new TuttiAuthError("OAuth state mismatch (possible CSRF)");
  }

  // 6. Exchange the code for tokens (PKCE verifier).
  const tokenRes = await fetch(new URL("/oauth/token", base).toString(), {
    method: "POST",
    headers: {
      "User-Agent": "okhttp/5.1.0",
      "Auth0-Client": AUTH0_CLIENT,
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      code_verifier: pkce.verifier,
    }),
  });
  if (!tokenRes.ok) {
    throw new TuttiAuthError(
      `token exchange failed: HTTP ${tokenRes.status} ${await tokenRes.text()}`,
    );
  }
  const token = (await tokenRes.json()) as {
    access_token: string;
    id_token?: string;
    token_type: string;
    expires_in: number;
    scope?: string;
  };
  return {
    accessToken: token.access_token,
    idToken: token.id_token,
    tokenType: token.token_type,
    expiresIn: token.expires_in,
    scope: token.scope,
  };
}
