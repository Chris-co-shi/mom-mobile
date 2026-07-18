# API mapping

Each page specification records Gateway route, method, permission, factory scope, idempotency requirement, offline eligibility, error codes, and expected response state.

The first VS-01 receiving command will target `POST /api/wms/receipts` only after the backend contract is approved.
