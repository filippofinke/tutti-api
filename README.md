<h1 align="center">Welcome to tutti-api 👋</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/npm/v/tutti-api.svg">
  <a href="https://filippofinke.github.io/tutti-api/" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/filippofinke/tutti-api/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://github.com/filippofinke/tutti-api/actions/workflows/ci.yml" target="_blank">
    <img alt="CI" src="https://github.com/filippofinke/tutti-api/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://twitter.com/filippofinke" target="_blank">
    <img alt="Twitter: filippofinke" src="https://img.shields.io/twitter/follow/filippofinke.svg?style=social" />
  </a>
</p>

> 🌐 Unofficial, dependency-free TypeScript client for the (reverse-engineered) private API of [tutti.ch](https://www.tutti.ch): search & filters, listings, seller profiles, categories, suggestions, live messaging, and Auth0 login.

> ⚠️ **Not affiliated with tutti.ch.** Reverse-engineered for interoperability and research. Respect tutti.ch's terms of service and rate limits — use at your own risk.

### 🏠 [Homepage](https://github.com/filippofinke/tutti-api)

### 📖 [Documentation](https://filippofinke.github.io/tutti-api/)

## Features

- 🔍 Fluent **search** with filters (category, price, location, intervals, single/multi-select) + cursor pagination
- 📦 **Listings**, seller **profiles**, **categories**, featured categories, search **suggestions**
- 💬 Live **messaging** — conversation & message streams as async iterators (send, read receipts, start a chat)
- 🔐 **Auth0 login** (authorization-code + PKCE) with a swappable captcha provider (manual, or Google Gemini vision)
- 🖼️ Built-in **dependency-free SVG→PNG** engine (renders the login captcha for OCR)
- 💾 Pluggable **session persistence** (in-memory / file / your own store)
- 🧩 Object-oriented (one instance per account), **zero runtime dependencies**, ESM + CJS + types

## Install

```sh
npm install tutti-api
```

Requires Node 18+ (global `fetch`) or a browser.

## Usage

```ts
import { TuttiClient } from "tutti-api";

const client = new TuttiClient(); // anonymous; random device hash

// Fluent search with filters
const result = await client
  .search("ledersofa")
  .category("furniture")
  .price({ min: 100, max: 5000 }) // or .freeOnly()
  .location(locality) // from client.localities.search()
  .select("companyAd", "private") // generic single-select
  .multiSelect("language", ["de"]) // generic multi-select
  .interval("year", { min: 2015 }) // generic numeric range
  .sort("timestamp", "desc")
  .fetch();

result.totalCount; // number
result.listings; // Listing[] (this page)
result.availableFilters; // filter names/options for this category
await result.next(); // next page (or null)
for await (const l of result.paginate()) {
  /* every listing across pages */
}

// Listing detail + locality autocomplete + token browse
const listing = await client.listings.get("81078697");
const locs = await client.localities.search("zür");
const page = await client.browse(searchToken).fetch();

// Filters for a category without fetching a listings page
const { availableFilters } = await client.search().category("cars").updateFilters();

// Categories, featured, seller profiles, autocomplete
await client.categories.tree();
await client.categories.featured();
await client.profiles.get(publicAccountID);
await client.profiles.listings(publicAccountID, { offset: 0, size: 30 });
await client.suggestions.search("sof");
```

### Authentication

tutti uses Auth0, then exchanges the JWT for a tutti **session token** sent as `X-Tutti-Auth` (~1-year validity).

```ts
import { LLMCaptchaProvider, ManualCaptchaProvider, Session } from "tutti-api";

// Full login. The Auth0 page has a captcha, solved by a swappable provider:
//   ManualCaptchaProvider (default) — saves the image, you type the text
//   LLMCaptchaProvider — Google Gemini vision (needs GEMINI_API_KEY)
await client.account.login({ username, password, captcha: new LLMCaptchaProvider() });

// Or bring your own token / Auth0 access token:
client.account.useToken("mc1x…");
await client.account.authenticateJWT(auth0AccessToken);
```

### Session persistence

`Session.toJSON()/fromJSON()` give a plain snapshot; a **`SessionStore`** persists it under a key. Providers are interchangeable — `InMemorySessionStore` and `FileSessionStore` ship; add Redis/DB by implementing `save / load / delete / keys`.

```ts
import { FileSessionStore, Session, TuttiClient } from "tutti-api";

const store = new FileSessionStore("./sessions");
await store.save("alice", client.session.toJSON());

const snap = await store.load("alice"); // restore later, no re-login
const restored = new TuttiClient({ session: snap ? Session.fromJSON(snap) : undefined });
```

### Messaging

Live chat is streamed as NDJSON over a long-lived request, exposed as **async iterators** (backlog first, then live). Requires an authenticated session.

```ts
const ac = new AbortController();
for await (const m of client.messaging.streamMessages(convId, { signal: ac.signal })) {
  const mine = m.senderPublicAccountId === client.session.auth?.accountId;
  console.log(mine ? "→" : "←", m.content.text);
}
// ac.abort() to stop

await client.messaging.send(convId, "Hello!");
await client.messaging.markRead(convId, offset);
await client.messaging.reply({ itemId, name, email, body }); // start a chat from a listing
```

## Demos

Store a session once; every demo loads it from `./.tutti-sessions` (gitignored):

```sh
# 1) store a session (token fast-path, or full login)
TUTTI_TOKEN=<X-Tutti-Auth> npm run demo:session
#   or: GEMINI_API_KEY=… TUTTI_USER=… TUTTI_PASS=… npm run demo:session

# 2) the rest load it (anonymous fallback if none)
npm run demo            # search "ubiquiti" + pagination
npm run demo:queries    # categories, featured, suggestions, updateFilters, profiles
npm run demo:messages   # live conversation + message streams (needs auth)
```

## Scripts

```sh
npm run build       # bundle ESM + CJS + .d.ts into dist/
npm run typecheck   # tsc --noEmit
npm run check       # Biome lint + format (write)
npm run docs        # generate API docs (TypeDoc) into docs/
```

## Caveats

- **Most filter element shapes are inferred** — captured requests only ever sent empty constraint arrays. Keyword search is unaffected; verify `location`/`interval`/`select` payloads against live traffic. The `price` shape is now verified against the app's `ListingPriceConstraint` input adapter: `freeOnly` is a **required** non-null Boolean (defaulted to `false` by `.price()`), `min`/`max` are optional.
- **Login captcha is interactive by default** — the minted session token is long-lived (~1yr), so you log in rarely; `useToken()` skips it. `auth.tutti.ch` is behind Cloudflare.
- **Default headers** mirror a captured Android client; override via `new TuttiClient({ app: { … } })`.

## Author

👤 **Filippo Finke**

* Website: [https://filippofinke.ch](https://filippofinke.ch)
* Twitter: [@filippofinke](https://twitter.com/filippofinke)
* Github: [@filippofinke](https://github.com/filippofinke)
* LinkedIn: [@filippofinke](https://linkedin.com/in/filippofinke)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />
Feel free to check the [issues page](https://github.com/filippofinke/tutti-api/issues). Commits follow [Conventional Commits](https://www.conventionalcommits.org/); releases are automated with [release-please](https://github.com/googleapis/release-please) — merged commits accumulate into a Release PR that, once merged, tags the version and publishes to npm.

## Show your support

Give a ⭐️ if this project helped you!

<a href="https://www.buymeacoffee.com/filippofinke">
  <img src="https://github.com/filippofinke/filippofinke/raw/main/images/buymeacoffe.png" alt="Buy Me A McFlurry">
</a>

## 📝 License

Copyright © 2026 [Filippo Finke](https://github.com/filippofinke).<br />
This project is [MIT](./LICENSE) licensed.

***

_Reverse-engineered for educational purposes — not affiliated with tutti.ch._
