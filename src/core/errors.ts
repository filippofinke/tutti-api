export class TuttiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Non-2xx HTTP response. */
export class TuttiHttpError extends TuttiError {
  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly body: string,
  ) {
    super(`HTTP ${status} ${statusText}: ${body.slice(0, 500)}`);
  }
}

/** GraphQL response carried an `errors` array. */
export class TuttiGraphQLError extends TuttiError {
  constructor(
    readonly operation: string,
    readonly errors: unknown[],
  ) {
    super(
      `GraphQL operation ${operation} failed: ${JSON.stringify(errors).slice(0, 500)}`,
    );
  }
}

/** Underlying fetch/transport threw (DNS, connection, etc.). */
export class TuttiNetworkError extends TuttiError {
  constructor(readonly cause: unknown) {
    super(
      `Network request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
}

/** Invalid arguments supplied to the builder (thrown synchronously). */
export class TuttiValidationError extends TuttiError {}

/** A step in the Auth0/login flow failed (bad credentials, captcha, redirect). */
export class TuttiAuthError extends TuttiError {}
