import { TuttiValidationError } from "../core/errors";
import type { GraphQLTransport } from "../core/graphql";
import type {
  Constraints,
  GqlSortDirection,
  GqlSortMode,
  IntervalConstraint,
  ListingSearchResult,
  Locality,
  PriceConstraint,
  SortDirection,
  SortField,
  StringConstraint,
} from "../core/types";
import {
  searchListingsByQuery,
  searchListingsByToken,
  updateFilters,
} from "../operations";
import { SearchResult } from "./result";

export type SearchMode = "query" | "token";

/** Chainable search query builder. Each call mutates the draft and returns
 *  `this`; `.fetch()` runs the search and returns a {@link SearchResult}. */
export class SearchBuilder {
  private _query?: string;
  private _token?: string;
  private _categoryId?: string;
  private _cursor: string | null = null;
  private _sort: GqlSortMode = "TIMESTAMP";
  private _direction: GqlSortDirection = "DESCENDING";
  private _imageHeight = 630;

  private _prices: PriceConstraint[] = [];
  private _localities: Locality[] = [];
  private _radius?: number;
  private _intervals: IntervalConstraint[] = [];
  private _strings: StringConstraint[] = [];

  constructor(
    private readonly transport: GraphQLTransport,
    private readonly mode: SearchMode,
    seed?: string,
  ) {
    if (mode === "query") this._query = seed;
    else this._token = seed;
  }

  /** Restrict to a category id (e.g. "furniture", "cars"). */
  category(id: string): this {
    this._categoryId = id;
    return this;
  }

  /** Price bounds in CHF. Omit min or max for open-ended. */
  price(p: { min?: number; max?: number; freeOnly?: boolean }): this {
    if (p.min != null && p.max != null && p.min > p.max) {
      throw new TuttiValidationError(
        `price.min (${p.min}) > price.max (${p.max})`,
      );
    }
    // freeOnly is a required non-null field on the wire; default it so a
    // price-range search doesn't 422 with a missing-field validation error.
    this._prices = [{ key: "price", freeOnly: false, ...p }];
    return this;
  }

  /** Only free items. */
  freeOnly(): this {
    this._prices = [{ key: "price", freeOnly: true }];
    return this;
  }

  /** Add a locality (from `client.localities.search()`). Repeatable. */
  location(locality: Locality): this {
    this._localities.push(locality);
    return this;
  }

  /** Search radius around the selected localities (as the app sends it, in km). */
  radius(km: number): this {
    this._radius = km;
    return this;
  }

  /** Numeric range filter (e.g. "year", "mileage"). */
  interval(name: string, range: { min?: number; max?: number }): this {
    if (range.min != null && range.max != null && range.min > range.max) {
      throw new TuttiValidationError(`interval ${name}: min > max`);
    }
    this._intervals.push({ key: name, ...range });
    return this;
  }

  /** Single-select filter (e.g. select("companyAd", "private")). */
  select(name: string, value: string): this {
    this._strings.push({ key: name, values: [value] });
    return this;
  }

  /** Multi-select filter (e.g. multiSelect("language", ["de", "fr"])). */
  multiSelect(name: string, values: string[]): this {
    this._strings.push({ key: name, values });
    return this;
  }

  /** Sort field + direction (default: timestamp desc — newest first). */
  sort(field: SortField, direction: SortDirection = "desc"): this {
    // Only TIMESTAMP observed in captures; field kept for forward-compat.
    void field;
    this._sort = "TIMESTAMP";
    this._direction = direction === "asc" ? "ASCENDING" : "DESCENDING";
    return this;
  }

  /** Thumbnail height requested from the API. */
  imageHeight(px: number): this {
    this._imageHeight = px;
    return this;
  }

  /** Set the pagination cursor (used internally by SearchResult.next()). */
  cursor(c: string | null): this {
    this._cursor = c;
    return this;
  }

  private buildConstraints(): Constraints {
    return {
      intervals: this._intervals,
      locations: this._localities.length
        ? [
            {
              key: "location",
              // Wire shape is a list of LocalityID strings, not full objects.
              localities: this._localities.map((l) => l.localityID),
              ...(this._radius != null ? { radius: this._radius } : {}),
            },
          ]
        : [],
      prices: this._prices,
      strings: this._strings,
    };
  }

  private buildVariables(): Record<string, unknown> {
    const common = {
      cursor: this._cursor,
      sort: this._sort,
      direction: this._direction,
      imageHeight: this._imageHeight,
      includePlacements: false,
      includeExtraInfo: true,
      placementsVariant: null as string | null,
    };
    if (this.mode === "token") {
      return { ...common, token: this._token, placementsVariant: "SMG" };
    }
    return {
      ...common,
      categoryId: this._categoryId ?? null,
      query: this._query ?? null,
      constraints: this.buildConstraints(),
    };
  }

  /** Execute the search and return the first page of results. */
  async fetch(): Promise<SearchResult> {
    const op =
      this.mode === "token" ? searchListingsByToken : searchListingsByQuery;
    const root = await this.transport.request<ListingSearchResult>(
      op,
      this.buildVariables(),
    );
    return new SearchResult(this, root);
  }

  /**
   * Fetch the available filters + result count for the current
   * category/query/constraints WITHOUT fetching a listings page
   * (UpdateFilters). Use `.availableFilters` / `.totalCount` on the result.
   */
  async updateFilters(): Promise<ListingSearchResult> {
    return this.transport.request<ListingSearchResult>(updateFilters, {
      categoryId: this._categoryId ?? null,
      query: this._query ?? null,
      constraints: this.buildConstraints(),
    });
  }
}
