# MOM Mobile

`mom-mobile` is the industrial PDA client for the MOM platform. It is based on uni-app, Vue 3, TypeScript, and Vite, with an App-first design and H5 used as the CI verification target.

## V1 responsibilities

- supplier delivery receiving and barcode scanning
- incoming inspection handoff
- putaway and location confirmation
- production material issue and return
- finished-goods putaway and shipping confirmation
- network-state awareness and persistent offline command queue
- request idempotency and correlation identifiers
- mobile user flows, prototypes, page-state matrices, and API mappings

## Runtime baseline

- Node.js 22
- pnpm 11.7.0
- uni-app Vue 3 CLI
- TypeScript 5
- Pinia

## Commands

```bash
pnpm install
pnpm dev:h5
pnpm type-check
pnpm build:h5
```

The production target is Android PDA through uni-app App. H5 is used for rapid interaction review and deterministic CI builds. Native packaging will be introduced only after scanner hardware and signing strategy are selected.

## Repository boundaries

- all backend access goes through MOM API Gateway
- platform-specific scanner, network, and storage APIs stay behind adapters
- pages do not write offline storage directly
- offline commands always carry an idempotency key and correlation ID
- a page requires a user flow, prototype, state matrix, component mapping, and API mapping before implementation

See `docs/architecture/module-boundaries.md` for details.
