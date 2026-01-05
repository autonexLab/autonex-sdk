# Intent Specification

An **Intent** is a signed, replay-resistant declaration of a desired on-chain action.

Mandatory fields:
- `agentId`: Solana `PublicKey`
- `actionType`: e.g. `swap`, `transfer`, `stake`, `vote`, `generic`
- `targetProgram`: CPI target program id (must be allowlisted)
- `method`: semantic method name (policy-gated)
- `params`: structured action payload (opaque to core SDK, but hashed deterministically)
- `constraints`: structured constraints (e.g. max slippage)
- `expiration`: unix ms expiry (reject if expired)
- `nonce`: unique replay-prevention value (SDK verifies presence; registry may enforce uniqueness)
- `signature`: Ed25519 signature by `agentId` over the canonical intent message

Security requirements:
- Reject unsigned intents
- Reject expired intents
- Reject unknown / non-allowlisted CPI targets
