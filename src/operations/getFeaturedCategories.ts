// Verbatim captured GraphQL document for GetFeaturedCategories (reverse-engineered, do not edit).
import type { Operation } from "../core/graphql";

export const getFeaturedCategories: Operation = {
  name: "GetFeaturedCategories",
  id: "f663bcce9541f1a9998bc3b9eaa5bf06f314fdbcb21865c0158258febc317ed5",
  rootField: "categoriesFeatured",
  document:
    "query GetFeaturedCategories($preferredImageSize: Int!) { categoriesFeatured { __typename ...FeaturedCategoryFields } }  fragment FeaturedCategoryFields on Category { categoryID label searchToken mainImage { rendition(width: $preferredImageSize) { src } } }",
};
