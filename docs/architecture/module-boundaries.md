# Mobile module boundaries

- `pages`: user interactions and orchestration only
- `components`: reusable presentation components
- `platform`: scanner, network, storage, vibration, and future hardware SDK adapters
- `api`: Gateway request contracts
- `offline`: durable command queue and synchronization policy
- `idempotency`: client request identifier generation
- `stores`: in-memory application state

Pages must not persist commands directly or access domain-service URLs. All API traffic goes through MOM Gateway.
