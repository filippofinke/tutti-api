import { TuttiGraphQLError } from "./errors";
import type { HttpClient } from "./http";

/** A captured, verbatim GraphQL operation. `rootField` is the top-level field
 *  in the response `data` object (often differs from `name`). */
export interface Operation {
  name: string;
  id: string; // Apollo persisted-query id (sha256 of the document)
  rootField: string;
  document: string;
}

interface GraphQLResponse<T> {
  data?: Record<string, T>;
  errors?: unknown[];
}

/** Runs GraphQL operations over an HttpClient. Operation-agnostic: add a new
 *  operation module and call `request` — no change here. */
export class GraphQLTransport {
  constructor(private readonly http: HttpClient) {}

  /** Execute an operation and return its unwrapped root field (`data[rootField]`). */
  async request<TResult>(
    op: Operation,
    variables: Record<string, unknown>,
  ): Promise<TResult> {
    const json = (await this.http.request("POST", "/graphql", {
      body: { operationName: op.name, query: op.document, variables },
      headers: {
        "X-APOLLO-OPERATION-NAME": op.name,
        "X-APOLLO-OPERATION-ID": op.id,
        Accept: "multipart/mixed; deferSpec=20220824, application/json",
      },
    })) as GraphQLResponse<TResult>;

    if (json.errors && json.errors.length > 0) {
      throw new TuttiGraphQLError(op.name, json.errors);
    }
    if (!json.data) {
      throw new TuttiGraphQLError(op.name, [
        { message: "response contained no data" },
      ]);
    }
    return json.data[op.rootField];
  }
}
