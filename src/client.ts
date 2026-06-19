import { DEFAULT_OAUTH, type OAuthConfig, type RawFetch } from "./auth/login";
import { GraphQLTransport } from "./core/graphql";
import { HttpClient } from "./core/http";
import { AccountResource } from "./resources/account";
import { CategoriesResource } from "./resources/categories";
import { ListingsResource } from "./resources/listings";
import { LocalitiesResource } from "./resources/localities";
import { MessagingResource } from "./resources/messaging";
import { ProfilesResource } from "./resources/profiles";
import { SuggestionsResource } from "./resources/suggestions";
import { SearchBuilder } from "./search/builder";
import { Session, type SessionOptions } from "./session/session";

export interface TuttiClientOptions extends SessionOptions {
  /** Default: https://api.tutti.ch */
  baseURL?: string;
  /** Default: v10 */
  apiVersion?: string;
  /** Inject a custom fetch (proxy, mocking). Default: global fetch. */
  fetch?: RawFetch;
  /** Override Auth0/OAuth parameters (client id, hosts, scope, …). */
  oauth?: Partial<OAuthConfig>;
  /** Provide a pre-built/restored session instead of the *Options fields. */
  session?: Session;
}

/**
 * Entry point. One instance = one session/account. Compose more accounts by
 * constructing more clients (optionally from `Session.fromJSON`).
 */
export class TuttiClient {
  readonly session: Session;
  private readonly transport: GraphQLTransport;

  readonly listings: ListingsResource;
  readonly localities: LocalitiesResource;
  readonly account: AccountResource;
  readonly messaging: MessagingResource;
  readonly categories: CategoriesResource;
  readonly profiles: ProfilesResource;
  readonly suggestions: SuggestionsResource;

  constructor(options: TuttiClientOptions = {}) {
    const fetchImpl =
      options.fetch ?? (globalThis.fetch as RawFetch | undefined);
    if (!fetchImpl) {
      throw new Error(
        "No fetch available. Use Node 18+, a browser, or pass options.fetch.",
      );
    }

    this.session =
      options.session ??
      new Session({
        tuttiHash: options.tuttiHash,
        app: options.app,
        language: options.language,
        auth: options.auth,
      });

    const http = new HttpClient({
      baseURL: options.baseURL ?? "https://api.tutti.ch",
      apiVersion: options.apiVersion ?? "v10",
      session: this.session,
      fetch: fetchImpl,
    });
    this.transport = new GraphQLTransport(http);

    const oauth: OAuthConfig = { ...DEFAULT_OAUTH, ...options.oauth };

    this.listings = new ListingsResource(this.transport);
    this.localities = new LocalitiesResource(this.transport);
    this.account = new AccountResource(http, this.session, fetchImpl, oauth);
    this.messaging = new MessagingResource(http);
    this.categories = new CategoriesResource(this.transport);
    this.profiles = new ProfilesResource(this.transport);
    this.suggestions = new SuggestionsResource(this.transport, this.session);
  }

  /** Keyword/category/filter search. `search('sofa').category('furniture')...` */
  search(query?: string): SearchBuilder {
    return new SearchBuilder(this.transport, "query", query);
  }

  /** Browse a category by its opaque search token (from a prior result). */
  browse(token: string): SearchBuilder {
    return new SearchBuilder(this.transport, "token", token);
  }
}
