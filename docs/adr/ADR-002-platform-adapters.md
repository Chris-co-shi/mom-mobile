# ADR-002: Platform APIs behind adapters

Status: Accepted

Pages cannot call scanner, storage, or network APIs directly. All platform behavior is exposed through `src/platform` adapters so real PDA SDKs can replace `uni.scanCode` without rewriting workflows.
