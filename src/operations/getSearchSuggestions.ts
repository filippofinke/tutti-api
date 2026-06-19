// Verbatim captured GraphQL document for GetSearchSuggestionsQuery (reverse-engineered, do not edit).
import type { Operation } from "../core/graphql";

export const getSearchSuggestions: Operation = {
  name: "GetSearchSuggestionsQuery",
  id: "c0145191dc1fdfef5f7552a6285a4b96dae6f8bd55fa6e16dfd841ca04e0076f",
  rootField: "searchSuggestions",
  document:
    "query GetSearchSuggestionsQuery($query: String!, $userIdentifier: SearchSuggestionsUserIdentifier!, $first: Int!) { searchSuggestions(query: $query, userIdentifier: $userIdentifier, first: $first) { suggestionGroups { __typename ...searchSuggestionGroupFields } } }  fragment searchSuggestionFields on SearchSuggestion { searchSuggestionID labelTitleHighlighted labelDescription searchToken deletable }  fragment searchSuggestionGroupFields on SearchSuggestionGroup { suggestions { __typename ...searchSuggestionFields } }",
};
