# @autonex/sdk-js

Solana-native policy-gated, intent-based execution SDK.

## Install

```bash
npm i @autonex/sdk-js
```

## Quickstart

```ts
import { AutonexClient, IntentBuilder, PolicyBuilder } from "@autonex/sdk-js";
import { PublicKey } from "@solana/web3.js";

const client = new AutonexClient({
  rpcUrl: "https://api.mainnet-beta.solana.com",
  programId: new PublicKey("11111111111111111111111111111111")
});

const agentId = new PublicKey("YourAgentPubkeyHere...");

const policy = new PolicyBuilder()
  .maxTxAmount(1_000_000) // lamports
  .dailyLimit(10_000_000)
  .allowProtocols([new PublicKey("So11111111111111111111111111111111111111112")])
  .allowMethods(["swap"])
  .maxSlippage(50) // bps
  .timeWindow({ startHourUtc: 0, endHourUtc: 23 })
  .build();

const intent = new IntentBuilder(agentId)
  .swap({
    targetProgram: new PublicKey("So11111111111111111111111111111111111111112"),
    method: "swap",
    params: { inMint: "...", outMint: "...", amountIn: "1000" },
    constraints: { maxSlippageBps: 50 },
    expirationUnixMs: Date.now() + 60_000
  })
  .withNonce("nonce-1")
  .build();

// You must sign the intent using your own signer (SDK never stores keys)
// intent.signature = ...

const sim = await client.simulation.simulate(intent, policy);
if (!sim.allowed) throw new Error(sim.reason);

// Execution always re-simulates; skipping simulation is not possible.
// const receipt = await client.execution.execute(intent, policy, { signer: walletAdapterSigner });
```
