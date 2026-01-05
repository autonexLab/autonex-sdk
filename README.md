# autonex-sdk

AUTONEX SDK is a Solana-native AI Agent Execution & Policy SDK.

It enables autonomous agents to execute on-chain actions through **policy-gated, intent-based execution**.
The SDK is designed to be infrastructure-grade: strict typing, explicit validation, simulation-first execution,
and deterministic receipts suitable for auditing.

This repository contains **SDK code only** (no UI, no frontend app, no marketing site).

## Repository layout

- packages/sdk-js
  - TypeScript (ESM) SDK: builders, validators, simulation gate, execution wrapper, receipt decoding.
- packages/sdk-rust
  - Rust crate with Solana-compatible types, deterministic serialization, and validation helpers.
- docs
  - Auditor-facing specs: intent model, policy engine rules, security assumptions.
- examples
  - Non-UI placeholders for agent workflows.

## Core domain models

AUTONEX defines four first-class concepts:

1) Agent
- agentId: Solana PublicKey
- role: application-defined string
- permissions: application-defined strings
- status: active | paused | revoked

2) Intent (signed)
- agentId
- actionType: swap | transfer | stake | vote | generic
- targetProgram: CPI target program id (must be allowlisted)
- method: semantic method name (policy-gated)
- params: structured payload (hashed deterministically)
- constraints: structured constraints (e.g. max slippage)
- expirationUnixMs: reject if expired
- nonce: replay-prevention value (presence is enforced; uniqueness can be enforced by a registry)
- signature: Ed25519 signature by agentId over the canonical intent message

3) Policy
- financialRules
- timeRules
- protocolRules
- riskRules

4) ExecutionReceipt
- executionHash (deterministic)
- agentId
- policyHash (deterministic)
- timestamp
- status
- error (optional)

## Security guarantees and non-goals

Guarantees (SDK-side):
- Reject unsigned intents
- Reject expired intents
- Enforce policy presence
- Prevent arbitrary CPI targets via protocol allowlisting
- Simulation-first: execution always simulates and rejects on simulation failure
- Deterministic hashing and receipt verification helpers

Non-goals:
- The SDK does NOT custody private keys
- The SDK does NOT auto-sign transactions
- The SDK does NOT bypass policy validation

Important note:
- This SDK enforces local validation and policy gating.
- On-chain enforcement is assumed to exist in the AUTONEX Solana program.

## TypeScript SDK usage (packages/sdk-js)

### Install

```bash
npm i @autonex/sdk-js
```

### Create client

```ts
import { AutonexClient } from "@autonex/sdk-js";
import { PublicKey } from "@solana/web3.js";

const client = new AutonexClient({
  rpcUrl: "https://api.mainnet-beta.solana.com",
  programId: new PublicKey("11111111111111111111111111111111")
});
```

### Build policy

Policies must include a protocol allowlist to prevent arbitrary CPI targets.

```ts
import { PublicKey } from "@solana/web3.js";

const allowedProgram = new PublicKey("So11111111111111111111111111111111111111112");

const policy = client.policy
  .build()
  .allowProtocols([allowedProgram])
  .allowMethods(["swap"]) // optional but recommended
  .maxTxAmount(1_000_000n)
  .dailyLimit(10_000_000n)
  .maxSlippage(50) // bps
  .timeWindow({ startHourUtc: 0, endHourUtc: 23 })
  .build();
```

### Build intent

```ts
import { PublicKey } from "@solana/web3.js";

const agentId = new PublicKey("YourAgentPubkeyHere...");

const intent = client.intent
  .build(agentId)
  .swap({
    targetProgram: allowedProgram,
    params: { amountIn: "1000", inMint: "...", outMint: "..." },
    constraints: { maxSlippageBps: 50 },
    expirationUnixMs: Date.now() + 60_000
  })
  .withNonce("nonce-1")
  .build();
```

### Sign intent (no key custody)

The SDK never stores keys. You must attach a signature yourself.

- Canonical message: `client.intent.canonicalMessage(intentWithoutSignature)`
- Signature: Ed25519 detached signature by agentId

Example using `tweetnacl` (for demos/tests only):

```ts
import nacl from "tweetnacl";

const msg = client.intent.canonicalMessage({ ...intent, signature: undefined } as any);
const signature = nacl.sign.detached(msg, agentSecretKey);

intent.signature = signature;
```

In production, use a secure signing mechanism (HSM, remote signer, wallet adapter, etc).

### Simulate (required)

```ts
const sim = await client.simulation.simulate(intent, policy);
if (!sim.allowed) throw new Error(sim.reason);
```

### Execute (simulation cannot be skipped)

Execution always re-simulates. There is no API that submits without simulation.

```ts
import type { TransactionSigner } from "@autonex/sdk-js";

const signer: TransactionSigner = {
  publicKey: payerPublicKey,
  signTransaction: async (tx) => wallet.signTransaction(tx)
};

const { signature } = await client.execution.execute(intent, policy, { signer });
```

## Receipts

The JS SDK includes a deterministic `ReceiptDecoder`:
- decode an on-chain receipt payload
- verify deterministic fields (executionHash)

See:
- packages/sdk-js/src/execution/ReceiptDecoder.ts

## Rust SDK usage (packages/sdk-rust)

The Rust crate focuses on:
- strong typing
- explicit errors
- deterministic serialization

Local validation helpers are available under `autonex_sdk_rust::validation`.

## Development

Node + TypeScript:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

Rust (optional):

```bash
cd packages/sdk-rust
cargo check
cargo test
```

## Versioning strategy

- v0.x: experimental
- v1.0: execution + policy stable
- v1.1: receipts + registry
- v2.0: reputation + coordination
