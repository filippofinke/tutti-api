import type { CaptchaChallenge, CaptchaProvider } from "./provider";

function extFor(contentType: string): string {
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  return "img";
}

export interface ManualCaptchaProviderOptions {
  /** Persist the challenge image so the user can view it. Default: write to disk. */
  save?: (challenge: CaptchaChallenge) => Promise<void> | void;
  /** Read the solution from the user. Default: prompt on stdin. */
  prompt?: (challenge: CaptchaChallenge) => Promise<string> | string;
  /** Path for the default `save` handler. Default: `tutti-captcha.<ext>`. */
  savePath?: string;
}

/**
 * Saves the captcha image for the user and waits for them to type the solution.
 * Defaults are Node-only (fs + stdin); pass `save`/`prompt` for other
 * environments. Swap this whole provider out for an automated one later.
 */
export class ManualCaptchaProvider implements CaptchaProvider {
  constructor(private readonly options: ManualCaptchaProviderOptions = {}) {}

  async solve(challenge: CaptchaChallenge): Promise<string> {
    await (this.options.save ?? this.defaultSave).call(this, challenge);
    const solution = await (this.options.prompt ?? this.defaultPrompt).call(
      this,
      challenge,
    );
    return solution.trim();
  }

  private async defaultSave(challenge: CaptchaChallenge): Promise<void> {
    const path =
      this.options.savePath ?? `tutti-captcha.${extFor(challenge.contentType)}`;
    const { writeFile } = await import("node:fs/promises");
    await writeFile(path, challenge.data);
    console.log(`[captcha] saved to ${path} — open it and read the text.`);
  }

  private async defaultPrompt(): Promise<string> {
    const { createInterface } = await import("node:readline/promises");
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      return await rl.question("[captcha] enter the text shown in the image: ");
    } finally {
      rl.close();
    }
  }
}
