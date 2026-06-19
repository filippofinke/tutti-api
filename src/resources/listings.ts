import type { GraphQLTransport } from "../core/graphql";
import type { Listing } from "../core/types";
import { getListingDetails } from "../operations";

/** Listing reads. Extend with more listing-related operations over time. */
export class ListingsResource {
  constructor(private readonly transport: GraphQLTransport) {}

  /** Full detail for a single listing by id. */
  async get(listingId: string): Promise<Listing> {
    return this.transport.request<Listing>(getListingDetails, {
      itemId: listingId,
    });
  }
}
