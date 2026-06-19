import type { GraphQLTransport } from "../core/graphql";
import { categories, getFeaturedCategories } from "../operations";

/** Category taxonomy reads. Returns raw GraphQL data (shape unmodeled). */
export class CategoriesResource {
  constructor(private readonly transport: GraphQLTransport) {}

  /** The full category tree (`CategoriesQuery`). */
  tree(): Promise<unknown> {
    return this.transport.request(categories, {});
  }

  /** Featured categories for the home screen (`GetFeaturedCategoriesQuery`). */
  featured(preferredImageSize = 200): Promise<unknown> {
    return this.transport.request(getFeaturedCategories, {
      preferredImageSize,
    });
  }
}
