# @autonex/sdk-js

Solana-native intent-based execution and policy enforcement SDK for autonomous agents.

This package provides:
- Typed domain models (Agent, Intent, Policy, ExecutionReceipt)
- Intent builders and signature validation
- Policy builders and allowlist enforcement
- Simulation-first execution (cannot be bypassed)
- Deterministic receipt decoding and verification helpers

## Install

```bash
npm i @autonex/sdk-js
```

## Key security properties

- No private key custody
- Reject unsigned intents
- Reject expired intents
- Policy is required
- Prevent arbitrary CPI targets via protocol allowlists
- Execution always simulates first

## Usage

```ts
import { AutonexClient } from "@autonex/sdk-js";
import { PublicKey } from "@solana/web3.js";

const client = new AutonexClient({
  rpcUrl: "https://api.mainnet-beta.solana.com",
  programId: new PublicKey("11111111111111111111111111111111")
});

const agentId = new PublicKey("YourAgentPubkeyHere...");
const allowedProgram = new PublicKey("So11111111111111111111111111111111111111112");

const policy = client.policy
  .build()
  .allowProtocols([allowedProgram])
  .allowMethods(["swap"])
  .maxSlippage(50)
  .build();

const intent = client.intent
  .build(agentId)
  .swap({
    targetProgram: allowedProgram,
    params: { amountIn: "1000" },
    constraints: { maxSlippageBps: 50 },
    expirationUnixMs: Date.now() + 60_000
  })
  .withNonce("nonce-1")
  .build();

// Sign the canonical intent message using your signer.
// intent.signature = ...

const sim = await client.simulation.simulate(intent, policy);
if (!sim.allowed) throw new Error(sim.reason);

// Execution always re-simulates.
// const { signature } = await client.execution.execute(intent, policy, { signer });
```

## Dev

```bash
npm run typecheck
npm run test
npm run build
```
