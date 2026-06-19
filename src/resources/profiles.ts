import type { GraphQLTransport } from "../core/graphql";
import type { SortDirection } from "../core/types";
import { getPublicAccountInfo, searchListingsByUser } from "../operations";

export interface UserListingsOptions {
  direction?: SortDirection; // default "desc"
  offset?: number; // default 0
  size?: number; // default 30
  imageHeight?: number; // default 630
}

/** Public seller profiles + their listings. Returns raw GraphQL data. */
export class ProfilesResource {
  constructor(private readonly transport: GraphQLTransport) {}

  /** A seller's public account info (`GetPublicAccountInfoQuery`). */
  get(publicAccountID: string): Promise<unknown> {
    return this.transport.request(getPublicAccountInfo, { publicAccountID });
  }

  /** A seller's listings, paged by offset/size (`SearchListingsByUserQuery`). */
  listings(
    publicAccountID: string,
    options: UserListingsOptions = {},
  ): Promise<unknown> {
    return this.transport.request(searchListingsByUser, {
      publicAccountID,
      sort: "TIMESTAMP",
      direction: options.direction === "asc" ? "ASCENDING" : "DESCENDING",
      offset: options.offset ?? 0,
      size: options.size ?? 30,
      imageHeight: options.imageHeight ?? 630,
    });
  }
}
