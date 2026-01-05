import { describe, expect, it } from "vitest";
import { PublicKey } from "@solana/web3.js";
import { IntentValidator } from "../src/intent/IntentValidator.js";
import type { Intent } from "../src/types/core.js";
import { makeAgentKeypair, signIntent } from "./helpers.js";

describe("IntentValidator", () => {
  it("rejects unsigned intents", () => {
    const { publicKey } = makeAgentKeypair();

    const intent: Intent = {
      agentId: publicKey,
      actionType: "transfer",
      targetProgram: new PublicKey("11111111111111111111111111111111"),
      method: "transfer",
      params: {},
      constraints: {},
      expirationUnixMs: Date.now() + 60_000,
      nonce: "n1",
      // signature intentionally missing
    };

    expect(() => IntentValidator.assertValid(intent)).toThrow(/unsigned/i);
  });

  it("rejects expired intents", () => {
    const { publicKey, secretKey } = makeAgentKeypair();

    const base: Omit<Intent, "signature"> = {
      agentId: publicKey,
      actionType: "swap",
      targetProgram: new PublicKey("11111111111111111111111111111111"),
      method: "swap",
      params: { amountIn: "1" },
      constraints: {},
      expirationUnixMs: Date.now() - 1,
      nonce: "n2",
    };

    const intent: Intent = { ...base, signature: signIntent(base, secretKey) };

    expect(() => IntentValidator.assertValid(intent)).toThrow(/expired/i);
  });

  it("accepts valid signed intents", () => {
    const { publicKey, secretKey } = makeAgentKeypair();

    const base: Omit<Intent, "signature"> = {
      agentId: publicKey,
      actionType: "generic",
      targetProgram: new PublicKey("11111111111111111111111111111111"),
      method: "do",
      params: { a: 1, b: [true, "x"] },
      constraints: { c: 2 },
      expirationUnixMs: Date.now() + 60_000,
      nonce: "n3",
    };

    const intent: Intent = { ...base, signature: signIntent(base, secretKey) };
    expect(() => IntentValidator.assertValid(intent)).not.toThrow();
  });
});
