import { describe, expect, it } from "vitest";
import { PublicKey } from "@solana/web3.js";
import { Executor } from "../src/execution/Executor.js";
import { Simulator } from "../src/simulation/Simulator.js";
import { PolicyBuilder } from "../src/policy/PolicyBuilder.js";
import type { Intent } from "../src/types/core.js";
import { makeAgentKeypair, signIntent } from "./helpers.js";

describe("Executor", () => {
  it("fails execution when simulation rejects (cannot be skipped)", async () => {
    const { publicKey, secretKey } = makeAgentKeypair();

    const programId = new PublicKey("11111111111111111111111111111111");

    // Stub Connection: should never reach sendTransaction because simulation rejects.
    const connection = {
      getLatestBlockhash: async () => ({ blockhash: "11111111111111111111111111111111", lastValidBlockHeight: 1 }),
      sendTransaction: async () => {
        throw new Error("should not send");
      },
    } as any;

    // Simulator that always rejects.
    class RejectingSimulator extends Simulator {
      override async simulate() {
        return { allowed: false, reason: "rejected" };
      }
    }

    const executor = new Executor(connection, programId, new RejectingSimulator());

    const policy = new PolicyBuilder().allowProtocols([programId]).allowMethods(["swap"]).build();

    const base: Omit<Intent, "signature"> = {
      agentId: publicKey,
      actionType: "swap",
      targetProgram: programId,
      method: "swap",
      params: {},
      constraints: {},
      expirationUnixMs: Date.now() + 60_000,
      nonce: "n6",
    };

    const intent: Intent = { ...base, signature: signIntent(base, secretKey) };

    await expect(
      executor.execute(intent, policy, {
        signer: {
          publicKey,
          signTransaction: async (tx: any) => tx,
        },
      })
    ).rejects.toThrow(/simulation/i);
  });
});
