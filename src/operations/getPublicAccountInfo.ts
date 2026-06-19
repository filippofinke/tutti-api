// Verbatim captured GraphQL document for GetPublicAccountInfo (reverse-engineered, do not edit).
import type { Operation } from "../core/graphql";

export const getPublicAccountInfo: Operation = {
  name: "GetPublicAccountInfo",
  id: "7dfaee0a6811ce250099d4c3321bb8ec41664d612be71c41134f1ed851f8dcb3",
  rootField: "publicAccountInfo",
  document:
    "query GetPublicAccountInfo($publicAccountID: PublicAccountID!) { publicAccountInfo(publicAccountID: $publicAccountID) { __typename ...publicAccountInfoFields listings { totalCount totalApprovedCount } } }  fragment publicAccountInfoFields on PublicAccountInfo { publicAccountID accountName locationName memberSince logoURL url subscriptionInfo { subscriptionClass subscriptionBadge { src } } }",
};
