// Types modeled from captured tutti.ch API responses. Fields seen rarely or
// nullable in captures are typed optional. The library never strips unknown
// fields — use `.raw()` to reach anything not modeled here.

// ---- Public, friendly sort options (mapped to GraphQL enums internally) ----
export type SortField = "timestamp";
export type SortDirection = "asc" | "desc";

// ---- GraphQL enum wire values ----
export type GqlSortMode = "TIMESTAMP";
export type GqlSortDirection = "ASCENDING" | "DESCENDING";

// ---- Locality (from SearchLocalities; also used inside location constraints) ----
export interface Locality {
  localityID: string;
  name: string;
  localityType?: string;
}

// ---- Search filter constraints (GraphQL input: ListingSearchConstraints) ----
// NOTE: element shapes verified against the app's Apollo input adapters
// (ConstraintsMapperKt / ListingLocationConstraint_InputAdapter).
export interface PriceConstraint {
  key: "price";
  // Required non-null Boolean on the wire (ListingPriceConstraint.freeOnly: Z,
  // checkNotNull in the Kotlin input type). Must always be sent — omitting it
  // makes the server reject the whole request with GRAPHQL_VALIDATION_FAILED.
  freeOnly: boolean;
  min?: number;
  max?: number;
}
// ListingLocationConstraint: `localities` is a list of LocalityID strings
// (NOT full Locality objects), with an optional radius.
export interface LocationConstraint {
  key: "location";
  localities: string[];
  radius?: number;
}
export interface IntervalConstraint {
  key: string;
  min?: number;
  max?: number;
}
export interface StringConstraint {
  key: string;
  values: string[];
}
export interface Constraints {
  intervals: IntervalConstraint[];
  locations: LocationConstraint[];
  prices: PriceConstraint[];
  strings: StringConstraint[];
}

// ---- Listing model ----
export interface ImageRendition {
  src: string;
}
export interface ListingImage {
  rendition?: ImageRendition;
}
export interface Canton {
  name?: string;
  shortName?: string;
  circularIcon?: ImageRendition;
}
export interface PostcodeInformation {
  canton?: Canton;
  locationName?: string;
  postcode?: string;
}
export interface SellerInfo {
  publicAccountID?: string;
  alias?: string;
  logo?: ImageRendition | null;
  subscriptionInfo?: unknown;
}
export interface CategoryRef {
  categoryID: string;
  label: string;
}
export interface Listing {
  __typename?: string;
  listingID: string;
  title: string;
  address?: string | null;
  formattedPrice?: string;
  primaryCategory?: CategoryRef;
  images?: ListingImage[];
  timestamp?: string;
  postcodeInformation?: PostcodeInformation;
  highlighted?: boolean;
  thumbnail?: ListingImage;
  sellerInfo?: SellerInfo;
  formattedSource?: string | null;
  [key: string]: unknown;
}

// ---- Filters returned by the search response (discovery). Permissive on
// purpose: the exact selected fields depend on the captured query document. ----
export interface Filter {
  __typename: string;
  name: string;
  label: string;
  [key: string]: unknown;
}

// ---- Connection / response envelope ----
export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}
export interface ListingConnection {
  totalCount?: number;
  edges?: Array<{ node: Listing }>;
  pageInfo?: PageInfo;
  placements?: unknown[];
}
export interface ListingSearchResult {
  __typename?: string;
  selectedCategory?: CategoryRef | null;
  suggestedCategories?: CategoryRef[];
  filters?: Filter[];
  galleryListings?: Listing[];
  listings?: ListingConnection;
  searchToken?: string | null;
  query?: string | null;
}

// ---- Messaging ----
export interface MessageContent {
  text?: string;
  [key: string]: unknown;
}
export interface Message {
  id: string;
  /** Sequence number within the conversation (1, 2, 3…). Drives read receipts. */
  offset: number;
  type: string; // "text"
  content: MessageContent;
  senderPublicAccountId: string;
  timestamp: string;
  [key: string]: unknown;
}
export interface Participant {
  publicAccountId: string;
  name?: string;
  role?: string; // "seller" | "buyer"
  active?: boolean;
}
export interface ConversationItem {
  id: string; // listing id
  subject?: string;
  active?: boolean;
  price?: unknown;
  language?: string | null;
  thumbnailName?: string | null;
}
export interface Conversation {
  id: string;
  item?: ConversationItem;
  participants?: Participant[];
  latestMessage?: {
    content?: MessageContent;
    senderPublicAccountId?: string;
    timestamp?: string;
    type?: string;
    offset?: number;
  };
  unreadMessages?: number;
  unreadMessageOffset?: number;
  archivedAt?: string | null;
  blockList?: { blocked: boolean; blockedBy: boolean };
  [key: string]: unknown;
}
