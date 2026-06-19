// Verbatim captured GraphQL document for SearchLocalities (reverse-engineered, do not edit).
import type { Operation } from "../core/graphql";

export const searchLocalities: Operation = {
  name: "SearchLocalities",
  id: "0bfe41259e77f875a21be04a97d2e7feb0c928b8687462eaaa96c8bd29561be7",
  rootField: "searchLocalities",
  document:
    "query SearchLocalities($search: String!, $excludeIds: [LocalityID!]) { searchLocalities(search: $search, exclude: $excludeIds) { __typename ...localityFields } }  fragment localityFields on Locality { localityID name localityType }",
};
