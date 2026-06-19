/**
 * Demo: search tutti.ch for "ubiquiti".
 * Run:  npm install  &&  npm run demo   (loads the stored session if present)
 *
 * Hits the real api.tutti.ch directly over HTTPS (no proxy/pinning bypass
 * needed — pinning only affected the Android app, not a plain Node fetch).
 */
import { loadClient } from "./demo-shared";

async function main(): Promise<void> {
  const client = await loadClient();

  console.log('Searching tutti.ch for "ubiquiti"…\n');

  const result = await client
    .search("ubiquiti")
    .sort("timestamp", "desc")
    .fetch();

  console.log(`Total matches: ${result.totalCount}`);
  console.log(`First page:    ${result.listings.length} listings\n`);

  for (const l of result.listings.slice(0, 10)) {
    const loc = l.postcodeInformation;
    const place = loc
      ? `${loc.postcode ?? ""} ${loc.locationName ?? ""}`.trim()
      : "";
    console.log(`• [${l.listingID}] ${l.title}`);
    console.log(
      `    ${l.formattedPrice ?? "—"}   ${place}   ${l.timestamp ?? ""}`,
    );
  }

  const filters = result.availableFilters.map((f) => f.name);
  if (filters.length) console.log(`\nAvailable filters: ${filters.join(", ")}`);

  // Auto-pagination across pages (capped so the demo stays short).
  console.log("\nAuto-paginating (up to 25 results across pages):");
  let n = 0;
  for await (const listing of result.paginate()) {
    n += 1;
    console.log(
      `  ${String(n).padStart(2)}. ${listing.title} — ${listing.formattedPrice ?? "—"}`,
    );
    if (n >= 25) break;
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Demo failed:", err);
  process.exit(1);
});
