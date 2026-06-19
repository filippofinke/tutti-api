/**
 * Unofficial TypeScript client for the (reverse-engineered) tutti.ch API.
 *
 * Entry point: {@link TuttiClient}. Search via {@link SearchBuilder}, read
 * listings/profiles/categories/suggestions, stream chat via
 * {@link MessagingResource}, authenticate via {@link AccountResource}
 * (Auth0 + swappable {@link CaptchaProvider}), and persist sessions with a
 * {@link SessionStore}.
 *
 * @packageDocumentation
 */
export {
  type CaptchaChallenge,
  type CaptchaProvider,
  LLMCaptchaProvider,
  type LLMCaptchaProviderOptions,
  ManualCaptchaProvider,
  type ManualCaptchaProviderOptions,
  parseDataUri,
} from "./auth/captcha";
export {
  DEFAULT_OAUTH,
  type LoginCredentials,
  type OAuthConfig,
  type OAuthTokens,
  type RawFetch,
  runLoginFlow,
} from "./auth/login";
export { TuttiClient, type TuttiClientOptions } from "./client";
export {
  TuttiAuthError,
  TuttiError,
  TuttiGraphQLError,
  TuttiHttpError,
  TuttiNetworkError,
  TuttiValidationError,
} from "./core/errors";
export { GraphQLTransport, type Operation } from "./core/graphql";
export {
  type FetchLike,
  type FetchResponse,
  HttpClient,
  type HttpClientOptions,
} from "./core/http";
export * from "./core/types";
export {
  AccountResource,
  type AuthenticatedAccount,
  type LoginOptions,
} from "./resources/account";
export { CategoriesResource } from "./resources/categories";
export { ListingsResource } from "./resources/listings";
export { LocalitiesResource } from "./resources/localities";
export {
  MessagingResource,
  type ReplyOptions,
  type StreamOptions,
} from "./resources/messaging";
export {
  ProfilesResource,
  type UserListingsOptions,
} from "./resources/profiles";
export {
  type SuggestionOptions,
  SuggestionsResource,
} from "./resources/suggestions";
export { SearchBuilder, type SearchMode } from "./search/builder";
export { SearchResult } from "./search/result";
export {
  type AppConfig,
  type AuthState,
  Session,
  type SessionOptions,
  type SessionSnapshot,
} from "./session/session";
export {
  FileSessionStore,
  InMemorySessionStore,
  type SessionStore,
} from "./session/store";
export { type RenderOptions, renderSvgToPng } from "./svg/render";
