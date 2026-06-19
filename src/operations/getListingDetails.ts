// Verbatim captured GraphQL document for GetListingDetails (reverse-engineered, do not edit).
import type { Operation } from "../core/graphql";

export const getListingDetails: Operation = {
  name: "GetListingDetails",
  id: "291bb5687dc211efa9f2f495c48596a8c885b35ecc14e84f7c052affebc1868e",
  rootField: "listing",
  document:
    "query GetListingDetails($itemId: ListingID!) { listing(listingID: $itemId) { __typename ...listingDetailsFields } }  fragment quickReplyFields on ListingsQuickReplyOption { label messageBody shortLabel trackingId }  fragment externalPlatformFields on ListingExternalPlatform { externalURL label logoURL }  fragment similarListingFields on Listing { listingID title formattedPrice primaryCategory { categoryID label } thumbnail { rendition { src } } sellerInfo { publicAccountID } }  fragment listingDetailsFields on Listing { listingID body address formattedPrice formattedSource highlighted images(first: 50) { rendition { src } } language phoneInfo { isMobile phoneHash } postcodeInformation { canton { name shortName circularIcon { src(format: SVG) } } locationName postcode } primaryCategory { categoryID label parent { categoryID label } } properties { __typename ... on ListingPropertyText { listingPropertyID label text } } replyInfo { __typename ... on ListingTextReply { quickReplies { __typename ...quickReplyFields } restrictedUntil } ... on ListingExternalTextReply { quickReplies { __typename ...quickReplyFields } externalPlatform { __typename ...externalPlatformFields } } ... on ListingExternalLinkReply { externalPlatform { __typename ...externalPlatformFields } } } sellerInfo { publicAccountID alias logo { rendition { src } } subscriptionInfo { subscriptionBadge { src } } } thumbnail { rendition { src } } timestamp title externalURL similarListings(first: 10) { edges { node { __typename ...similarListingFields } } } }",
};
