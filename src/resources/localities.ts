import type { GraphQLTransport } from "../core/graphql";
import type { Locality } from "../core/types";
import { searchLocalities } from "../operations";

/** Locality lookup — feed results into `SearchBuilder.location()`. */
export class LocalitiesResource {
  constructor(private readonly transport: GraphQLTransport) {}

  /** Autocomplete localities by free text (e.g. "zür"). */
  async search(text: string, excludeIds: string[] = []): Promise<Locality[]> {
    const result = await this.transport.request<Locality[]>(searchLocalities, {
      search: text,
      excludeIds,
    });
    return result ?? [];
  }
}
