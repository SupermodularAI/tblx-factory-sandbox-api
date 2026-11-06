# fleet-api

The fleet data contract (`Vehicle`, `Trip`) and validating parsers for it. It is the **upstream sandbox repository for the tb.lx PDLC factory**: [`fleet-insights`](https://github.com/moraisjose/tblx-factory-sandbox) depends on it, so a ticket can need changes in both repositories. Nothing here is production code.

```sh
npm test
```

```js
import { parseTrips, parseVehicles, FleetDataError } from "fleet-api";
const trips = parseTrips(await readFile("trips.json", "utf8")); // throws FleetDataError with a field path
```

## How fleet-insights gets it

`fleet-insights` declares `"fleet-api": "github:moraisjose/tblx-factory-sandbox-api"`, with no lockfile, so it picks up `main` on install. In the factory's sandbox, a ticket split across both repositories links the built branch instead: `npm install --no-save ../api`.

## Ideas for test tickets

- Add an optional `fuelType` (`"diesel" | "electric"`) to `Trip` and validate it (fleet-insights then reports electric vehicles apart).
- Add `parseVehicles` checks for duplicate ids.
- Export a `co2Kg(trip)` helper (2.64 kg CO₂ per litre of diesel) for fleet-insights to report.

## Branch rules

`main` is protected. The factory pushes only to `factory/*` branches and opens draft pull requests; people review and merge.
