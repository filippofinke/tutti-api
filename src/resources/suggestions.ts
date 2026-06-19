import type { GraphQLTransport } from "../core/graphql";
import { getSearchSuggestions } from "../operations";
import type { Session } from "../session/session";

export interface SuggestionOptions {
  /** Stable per-user/device id. Defaults to the session's tuttiHash. */
  userIdentifier?: string;
  /** Max suggestions. Default 6. */
  first?: number;
}

/** Search-box autocomplete suggestions. Returns raw GraphQL data. */
export class SuggestionsResource {
  constructor(
    private readonly transport: GraphQLTransport,
    private readonly session: Session,
  ) {}

  /** Suggestions for a partial query (`GetSearchSuggestionsQuery`). */
  search(query: string, options: SuggestionOptions = {}): Promise<unknown> {
    return this.transport.request(getSearchSuggestions, {
      query,
      userIdentifier: options.userIdentifier ?? this.session.tuttiHash,
      first: options.first ?? 6,
    });
  }
}
