/**
 * Demonstrate the read GraphQL operations. Loads the stored session
 * (run `npm run demo:session` first; otherwise runs anonymously).
 *   npm run demo:queries
 */
import { loadClient } from "./demo-shared";

async function main(): Promise<void> {
  const client = await loadClient();

  // Category taxonomy
  const tree = (await client.categories.tree()) as Array<{
    categoryID: string;
  }>;
  console.log(
    `categories.tree: ${tree.length} root categories — ${tree
      .slice(0, 6)
      .map((c) => c.categoryID)
      .join(", ")}`,
  );
  const featured = (await client.categories.featured()) as unknown[];
  console.log(
    `categories.featured: ${Array.isArray(featured) ? featured.length : "?"} entries`,
  );

  // Autocomplete
  const sug = (await client.suggestions.search("sof")) as {
    suggestionGroups?: Array<{ suggestions?: unknown[] }>;
  };
  const flat = (sug.suggestionGroups ?? []).flatMap((g) => g.suggestions ?? []);
  console.log(`suggestions.search("sof"): ${flat.length} suggestions`);

  // Filters for a category, no listings page
  const uf = await client.search().category("cars").updateFilters();
  console.log(
    `updateFilters(cars): totalCount=${uf.listings?.totalCount}, filters=[${(uf.filters ?? []).map((f) => f.name).join(", ")}]`,
  );

  // Seller profile + their listings — use the session account, else a seller from search
  let accountId = client.session.auth?.accountId;
  if (!accountId) {
    const res = await client.search("ubiquiti").fetch();
    accountId = res.listings.find((l) => l.sellerInfo?.publicAccountID)
      ?.sellerInfo?.publicAccountID;
  }
  if (accountId) {
    const profile = (await client.profiles.get(accountId)) as {
      accountName?: string;
    };
    console.log(
      `profiles.get(${accountId}): ${profile?.accountName ?? JSON.stringify(profile).slice(0, 120)}`,
    );
    const userListings = await client.profiles.listings(accountId, { size: 5 });
    console.log(
      `profiles.listings(${accountId}): ${JSON.stringify(userListings).slice(0, 140)}`,
    );
  } else {
    console.log("profiles: no account id available to demo");
  }
}

main().catch((err) => {
  console.error("Queries demo failed:", err);
  process.exit(1);
});
