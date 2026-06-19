import type {
  Filter,
  Listing,
  ListingSearchResult,
  PageInfo,
} from "../core/types";
import type { SearchBuilder } from "./builder";

/** One page of search results, plus helpers to paginate and to discover the
 *  filters available for the current query/category. */
export class SearchResult {
  constructor(
    private readonly builder: SearchBuilder,
    private readonly root: ListingSearchResult,
  ) {}

  /** Total matching listings server-side (across all pages). */
  get totalCount(): number {
    return this.root.listings?.totalCount ?? 0;
  }

  /** Listings on this page. */
  get listings(): Listing[] {
    return (this.root.listings?.edges ?? []).map((e) => e.node);
  }

  /** Featured/hero listings returned alongside the result set. */
  get galleryListings(): Listing[] {
    return this.root.galleryListings ?? [];
  }

  /** Filters available for this query/category (names, labels, options). */
  get availableFilters(): Filter[] {
    return this.root.filters ?? [];
  }

  /** Opaque token to browse this category via `client.browse(token)`. */
  get searchToken(): string | null {
    return this.root.searchToken ?? null;
  }

  get pageInfo(): PageInfo {
    return (
      this.root.listings?.pageInfo ?? { hasNextPage: false, endCursor: null }
    );
  }

  get hasNextPage(): boolean {
    return this.pageInfo.hasNextPage;
  }

  /** Fetch the next page, or null if there is none. */
  async next(): Promise<SearchResult | null> {
    const { hasNextPage, endCursor } = this.pageInfo;
    if (!hasNextPage || !endCursor) return null;
    return this.builder.cursor(endCursor).fetch();
  }

  /** Async-iterate every listing across all pages. */
  async *paginate(): AsyncGenerator<Listing> {
    let page: SearchResult | null = this;
    while (page) {
      for (const listing of page.listings) yield listing;
      page = await page.next();
    }
  }

  /** The raw, unmodeled response root (escape hatch). */
  raw(): ListingSearchResult {
    return this.root;
  }
}
