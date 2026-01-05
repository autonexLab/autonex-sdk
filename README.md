# autonex-sdk

AUTONEX SDK is a Solana-native AI Agent Execution & Policy SDK.

It enables autonomous agents to execute on-chain actions through policy-gated, intent-based execution with mandatory simulation and deterministic receipts.

This repository contains SDK code only (no UI, no app).

## Monorepo layout
- packages/sdk-js - TypeScript (ESM) SDK
- packages/sdk-rust - Rust (Solana-compatible) types + deterministic serialization + validation
- docs - auditor-facing specifications
- examples - non-UI usage examples (placeholders)

## Security invariants
- No wallet private key custody
- Reject unsigned intents
- Reject expired intents
- Enforce policy presence
- Prevent arbitrary CPI targets via protocol allowlists
- Simulation is mandatory; execution always simulates first

## JS usage (skeleton)

```ts
import { AutonexClient } from "@autonex/sdk-js";
import { PublicKey } from "@solana/web3.js";

const client = new AutonexClient({
  rpcUrl: "https://api.mainnet-beta.solana.com",
  programId: new PublicKey("11111111111111111111111111111111")
});

const agentId = new PublicKey("YourAgentPubkeyHere...");

const policy = client.policy
  .build()
  .maxTxAmount(1_000_000n)
  .dailyLimit(10_000_000n)
  .allowProtocols([new PublicKey("So11111111111111111111111111111111111111112")])
  .allowMethods(["swap"])
  .maxSlippage(50)
  .timeWindow({ startHourUtc: 0, endHourUtc: 23 })
  .build();

const intent = client.intent
  .build(agentId)
  .swap({
    targetProgram: new PublicKey("So11111111111111111111111111111111111111112"),
    params: { amountIn: "1000", inMint: "...", outMint: "..." },
    constraints: { maxSlippageBps: 50 },
    expirationUnixMs: Date.now() + 60_000
  })
  .withNonce("nonce-1")
  .build();

// Attach an Ed25519 signature from your own signing mechanism.
// The SDK verifies the signature but never stores private keys.

const sim = await client.simulation.simulate(intent, policy);
if (!sim.allowed) throw new Error(sim.reason);

// Execution always re-simulates; skipping simulation is not possible.
// const { signature } = await client.execution.execute(intent, policy, { signer: walletSigner });
```

## Versioning
- v0.x: experimental
- v1.0: execution + policy stable
- v1.1: receipts + registry
- v2.0: reputation + coordination

## Development

Node.js (for TypeScript SDK):

```bash
npm install
npm run typecheck
npm run test
npm run build
```

Rust (optional, for sdk-rust):

```bash
cd packages/sdk-rust
cargo check
cargo test
```
