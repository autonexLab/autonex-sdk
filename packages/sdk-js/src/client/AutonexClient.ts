import { Connection, PublicKey } from "@solana/web3.js";
import { AgentRegistry } from "../agent/AgentRegistry.js";
import { canonicalIntentMessage, intentHash, IntentValidator } from "../intent/IntentValidator.js";
import { IntentBuilder } from "../intent/IntentBuilder.js";
import { canonicalPolicyMessage, policyHash, PolicyValidator } from "../policy/PolicyValidator.js";
import { PolicyBuilder } from "../policy/PolicyBuilder.js";
import { Simulator } from "../simulation/Simulator.js";
import { Executor } from "../execution/Executor.js";
import { ReceiptDecoder } from "../execution/ReceiptDecoder.js";

export type AutonexClientConfig = {
  rpcUrl: string;
  programId: PublicKey;
};

export class AutonexClient {
  readonly connection: Connection;
  readonly programId: PublicKey;

  readonly agent: AgentRegistry;
  readonly policy: {
    build(): PolicyBuilder;
    validate(policy: unknown): void;
    canonicalMessage(policy: Parameters<typeof canonicalPolicyMessage>[0]): Uint8Array;
    hash(policy: Parameters<typeof policyHash>[0]): Uint8Array;
  };
  readonly intent: {
    build(agentId: PublicKey): IntentBuilder;
    validate(intent: unknown): void;
    canonicalMessage(intent: Parameters<typeof canonicalIntentMessage>[0]): Uint8Array;
    hash(intent: Parameters<typeof intentHash>[0]): Uint8Array;
  };
  readonly simulation: Simulator;
  readonly execution: Executor;
  readonly receipts: ReceiptDecoder;

  constructor(config: AutonexClientConfig) {
    this.connection = new Connection(config.rpcUrl, "confirmed");
    this.programId = config.programId;

    this.agent = new AgentRegistry();
    this.policy = {
      build: () => new PolicyBuilder(),
      validate: (policy: unknown) => PolicyValidator.assertValid(policy as any),
      canonicalMessage: canonicalPolicyMessage,
      hash: policyHash,
    };
    this.intent = {
      build: (agentId: PublicKey) => new IntentBuilder(agentId),
      validate: (intent: unknown) => IntentValidator.assertValid(intent as any),
      canonicalMessage: canonicalIntentMessage,
      hash: intentHash,
    };

    this.simulation = new Simulator();
    this.execution = new Executor(this.connection, this.programId, this.simulation);
    this.receipts = new ReceiptDecoder();
  }
}
