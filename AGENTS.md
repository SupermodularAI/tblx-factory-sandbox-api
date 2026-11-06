# Repository guidance

- `fleet-api` is an npm package that `moraisjose/tblx-factory-sandbox` (fleet-insights) imports. A change to the
  contract here can break it: keep `index.d.ts` and `src/index.js` in step, and say in the PR what the downstream must change.
- Plain JavaScript (ESM) with JSDoc, no build step and no dependencies. It must stay runnable from `node_modules`,
  where Node does not strip TypeScript types, so do not add `.ts` sources or a `prepare` script.
- `npm test` runs `node --test`. Every change keeps it green and adds a test for new behaviour.
- Distances are km, fuel is litres, times are ISO 8601 strings in UTC. Parser errors are `FleetDataError` with a `path`.
