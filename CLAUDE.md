# Demo Inspector SDK

Zero-dependency npm package that helps storefront developers tag DOM elements for the Demo Inspector Chrome extension.

## Structure

- `src/mesh.js` — Mesh mode tagging (`tagMeshSource`, `tagMeshSources`, `SOURCES`)
- `src/eds.js` — EDS mode tagging (`tagBlock`, `tagSlot`)
- `src/tracking.js` — GraphQL tracking (`wrapFetcher`, `trackQuery`, `trackData`, `detectSource`)
- `src/index.js` — Public API re-exports

## Testing

```bash
npm test        # run once
npm run test:watch  # watch mode
```

Uses vitest with jsdom environment.

## Data Attribute Contract

The Chrome extension detects these attributes:
- `data-inspector-source` — values: `commerce`, `catalog`, `search`
- `data-block-name` — EDS block name (triggers EDS mode)
- `data-slot` — slot name
- `data-slot-key` — slot key (alternative to data-slot)

GraphQL tracking uses two window globals set by the extension's page bridge at `document_start`:
- `window.__demoInspectorTrackQuery` — receives query metadata (`{id, name, source, timestamp, responseTime}`)
- `window.__demoInspectorStoreData` — receives full response data (`{queryName, source, data, timestamp}`)
