// Captcha abstraction. The tutti Auth0 login page embeds a simple distorted-text
// captcha as an inline SVG data URI. Solving is behind a provider interface so
// it can be swapped (ManualCaptchaProvider, LLMCaptchaProvider, …).

export interface CaptchaChallenge {
  /** Decoded image bytes. */
  data: Uint8Array;
  /** MIME type, e.g. "image/svg+xml". */
  contentType: string;
  /** Original `data:` URI as found on the login page. */
  dataUri: string;
}

/** Strategy for turning a captcha image into its solution text. */
export interface CaptchaProvider {
  solve(challenge: CaptchaChallenge): Promise<string>;
}

/** Parse a `data:<mime>;base64,<payload>` URI into a challenge. */
export function parseDataUri(dataUri: string): CaptchaChallenge {
  const m = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(dataUri);
  if (!m) throw new Error("Unrecognized captcha data URI");
  const [, contentType, isBase64, payload] = m;
  const data = isBase64
    ? Uint8Array.from(atob(payload), (c) => c.charCodeAt(0))
    : new TextEncoder().encode(decodeURIComponent(payload));
  return { data, contentType, dataUri };
}
