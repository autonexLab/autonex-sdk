import { describe, expect, it } from "vitest";
import { PublicKey } from "@solana/web3.js";
import { PolicyBuilder } from "../src/policy/PolicyBuilder.js";
import { PolicyValidator } from "../src/policy/PolicyValidator.js";
import { Simulator } from "../src/simulation/Simulator.js";
import type { Intent } from "../src/types/core.js";
import { makeAgentKeypair, signIntent } from "./helpers.js";

describe("PolicyValidator + Simulator", () => {
  it("rejects missing allowProtocols (prevents arbitrary CPI targets)", () => {
    const policy = new PolicyBuilder().allowMethods(["swap"]).build();
    expect(() => PolicyValidator.assertValid(policy)).toThrow(/allowProtocols/i);
  });

  it("rejects intents with non-allowlisted target programs", async () => {
    const simulator = new Simulator();
    const { publicKey, secretKey } = makeAgentKeypair();

    const allowedProgram = new PublicKey("11111111111111111111111111111111");
    const disallowedProgram = new PublicKey("So11111111111111111111111111111111111111112");

    const policy = new PolicyBuilder().allowProtocols([allowedProgram]).allowMethods(["swap"]).build();

    const base: Omit<Intent, "signature"> = {
      agentId: publicKey,
      actionType: "swap",
      targetProgram: disallowedProgram,
      method: "swap",
      params: { amountIn: "1" },
      constraints: {},
      expirationUnixMs: Date.now() + 60_000,
      nonce: "n4",
    };

    const intent: Intent = { ...base, signature: signIntent(base, secretKey) };

    const res = await simulator.simulate(intent, policy);
    expect(res.allowed).toBe(false);
    expect(res.reason.toLowerCase()).toContain("allowlist");
  });

  it("rejects intents with non-allowlisted methods when allowMethods is set", async () => {
    const simulator = new Simulator();
    const { publicKey, secretKey } = makeAgentKeypair();

    const program = new PublicKey("11111111111111111111111111111111");
    const policy = new PolicyBuilder().allowProtocols([program]).allowMethods(["swap"]).build();

    const base: Omit<Intent, "signature"> = {
      agentId: publicKey,
      actionType: "swap",
      targetProgram: program,
      method: "transfer",
      params: {},
      constraints: {},
      expirationUnixMs: Date.now() + 60_000,
      nonce: "n5",
    };

    const intent: Intent = { ...base, signature: signIntent(base, secretKey) };

    const res = await simulator.simulate(intent, policy);
    expect(res.allowed).toBe(false);
    expect(res.reason.toLowerCase()).toContain("method");
  });
});
