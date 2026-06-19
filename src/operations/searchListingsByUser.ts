// Verbatim captured GraphQL document for SearchListingsByUser (reverse-engineered, do not edit).
import type { Operation } from "../core/graphql";

export const searchListingsByUser: Operation = {
  name: "SearchListingsByUser",
  id: "851d216fce882eec0c0de7daae432b4c12b977a5076c0cfd85320fcc9d2dadc5",
  rootField: "publicAccountInfo",
  document:
    "query SearchListingsByUser($publicAccountID: PublicAccountID!, $sort: ListingSortMode!, $direction: SortDirection!, $offset: Int = 0 , $size: Int = 30 , $imageHeight: Int) { publicAccountInfo(publicAccountID: $publicAccountID) { listings(sort: $sort, direction: $direction, offset: $offset, size: $size) { __typename ...PublicListingResultFields } } }  fragment listingFields on Listing { listingID title address formattedPrice primaryCategory { categoryID label } images(first: 50) { rendition(height: $imageHeight) { src } } timestamp postcodeInformation { canton { name shortName circularIcon { src(format: SVG) } } locationName postcode } highlighted thumbnail { rendition { src } } sellerInfo { publicAccountID alias logo { rendition { src } } subscriptionInfo { subscriptionBadge { src } } } formattedSource }  fragment PublicListingResultFields on PublicAccountListings { totalCount listings { __typename ...listingFields } }",
};
