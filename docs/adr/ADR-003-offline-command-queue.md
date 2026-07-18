# ADR-003: Persistent offline command queue

Status: Accepted

Offline writes are stored as commands, not cached HTTP responses. Every command contains an idempotency key, correlation ID, creation time, retry count, and explicit status. Server-side idempotency remains mandatory.
