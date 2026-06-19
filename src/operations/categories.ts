// Verbatim captured GraphQL document for Categories (reverse-engineered, do not edit).
import type { Operation } from "../core/graphql";

export const categories: Operation = {
  name: "Categories",
  id: "a2685d3153f06fcab78644435fa8f000baf37d3aea951848ef216be78e149ad1",
  rootField: "categoriesRoot",
  document:
    "query Categories { categoriesRoot { __typename ...categoryFragment children { __typename ...categoryFragment children { __typename ...categoryFragment children { __typename ...categoryFragment } } } } }  fragment categoryFragment on Category { categoryID label parent { categoryID label } }",
};
