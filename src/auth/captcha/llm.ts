import { TuttiAuthError } from "../../core/errors";
import { renderSvgToPng } from "../../svg/render";
import type { CaptchaChallenge, CaptchaProvider } from "./provider";

export interface LLMCaptchaProviderOptions {
  /** Google AI API key. Default: `process.env.GEMINI_API_KEY`. */
  apiKey?: string;
  /** Model id. Default: "gemini-3.1-flash-lite". */
  model?: string;
  /** Instruction sent alongside the image. */
  prompt?: string;
  /** API base. Default: "https://generativelanguage.googleapis.com/v1beta". */
  baseURL?: string;
  /** Override the image mime type sent to the model (else the challenge's). */
  mimeType?: string;
  /** Injectable fetch (default: global fetch). */
  fetch?: typeof globalThis.fetch;
  /** Retries on transient errors (503/429/500). Default 4 (exponential backoff). */
  maxRetries?: number;
  /**
   * Convert the challenge image to a Gemini-supported raster (PNG/JPEG/WEBP).
   * Gemini vision rejects `image/svg+xml`, and the tutti captcha is an SVG —
   * supply a rasterizer (e.g. a small SVG→PNG step) to auto-solve it.
   */
  rasterize?: (
    challenge: CaptchaChallenge,
  ) => Promise<{ data: Uint8Array; mimeType: string }>;
}

const DEFAULT_PROMPT =
  "Extract the 6 characters in this image, only a-zA-Z0-9 allowed";

interface GenerateContentResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

/** Base64-encode raw bytes (chunked to avoid call-stack limits). */
function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

/** Base64 of the challenge image — reuse the data URI's payload when possible. */
function toBase64(challenge: CaptchaChallenge): string {
  const marker = ";base64,";
  const i = challenge.dataUri.indexOf(marker);
  if (i >= 0) return challenge.dataUri.slice(i + marker.length);
  return bytesToBase64(challenge.data);
}

/**
 * Solves captchas with Google's Generative Language API (Gemini) via vision:
 * the image is sent as inline_data and the model returns the characters.
 * Plain `fetch`, no SDK.
 */
export class LLMCaptchaProvider implements CaptchaProvider {
  constructor(private readonly options: LLMCaptchaProviderOptions = {}) {}

  async solve(challenge: CaptchaChallenge): Promise<string> {
    const apiKey = this.options.apiKey ?? process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new TuttiAuthError(
        "LLMCaptchaProvider: no API key (set GEMINI_API_KEY or options.apiKey)",
      );
    }
    const model = this.options.model ?? "gemini-3.1-flash-lite";
    const baseURL =
      this.options.baseURL ??
      "https://generativelanguage.googleapis.com/v1beta";
    const doFetch = this.options.fetch ?? globalThis.fetch;

    // Gemini vision rejects SVG, so rasterize: a caller-supplied converter wins,
    // else the built-in (dependency-free) SVG→PNG engine handles SVG captchas.
    let raster = this.options.rasterize
      ? await this.options.rasterize(challenge)
      : null;
    if (!raster && /svg|xml/i.test(challenge.contentType)) {
      const svg = new TextDecoder().decode(challenge.data);
      raster = { data: renderSvgToPng(svg), mimeType: "image/png" };
    }
    const mimeType =
      this.options.mimeType ?? raster?.mimeType ?? challenge.contentType;
    const data = raster ? bytesToBase64(raster.data) : toBase64(challenge);

    const url = `${baseURL}/models/${model}:generateContent`;
    const requestInit = {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType, data } },
              { text: this.options.prompt ?? DEFAULT_PROMPT },
            ],
          },
        ],
      }),
    };

    const maxRetries = this.options.maxRetries ?? 4;
    let res = await doFetch(url, requestInit);
    for (let attempt = 0; !res.ok; attempt++) {
      const transient =
        res.status === 503 || res.status === 429 || res.status === 500;
      if (!transient || attempt >= maxRetries) {
        throw new TuttiAuthError(
          `LLM captcha request failed: HTTP ${res.status} ${await res.text()}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 800 * 2 ** attempt));
      res = await doFetch(url, requestInit);
    }

    const json = (await res.json()) as GenerateContentResponse;
    const text = (json.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("")
      .trim();

    // Model should return just the characters; be tolerant of stray prose.
    const match = text.match(/[A-Za-z0-9]{6}/);
    const solution = match
      ? match[0]
      : text.replace(/[^A-Za-z0-9]/g, "").slice(0, 6);
    if (!solution) {
      throw new TuttiAuthError(
        `LLM returned no usable captcha solution: ${text.slice(0, 100)}`,
      );
    }
    return solution;
  }
}
