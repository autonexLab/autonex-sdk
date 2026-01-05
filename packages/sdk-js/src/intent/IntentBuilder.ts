import type { PublicKey } from "@solana/web3.js";
import type { ActionType, Intent, JsonValue } from "../types/core.js";
import type {
  GenericIntentParams,
  StakeIntentParams,
  SwapIntentParams,
  TransferIntentParams,
  VoteIntentParams,
} from "./IntentTypes.js";

export class IntentBuilder {
  private intent: Omit<Intent, "signature">;

  constructor(agentId: PublicKey) {
    this.intent = {
      agentId,
      actionType: "generic",
      targetProgram: agentId, // placeholder; validator/simulator will reject until set by an action method
      method: "",
      params: {},
      constraints: {},
      expirationUnixMs: Date.now() + 60_000,
      nonce: "",
    };
  }

  withNonce(nonce: string): this {
    this.intent.nonce = nonce;
    return this;
  }

  withConstraints(constraints: JsonValue): this {
    this.intent.constraints = constraints;
    return this;
  }

  withExpirationUnixMs(expirationUnixMs: number): this {
    this.intent.expirationUnixMs = expirationUnixMs;
    return this;
  }

  swap(input: SwapIntentParams): this {
    return this.setAction("swap", input.targetProgram, input.method ?? "swap", input.params, input.constraints);
  }

  transfer(input: TransferIntentParams): this {
    return this.setAction(
      "transfer",
      input.targetProgram,
      input.method ?? "transfer",
      input.params,
      input.constraints
    );
  }

  stake(input: StakeIntentParams): this {
    return this.setAction("stake", input.targetProgram, input.method ?? "stake", input.params, input.constraints);
  }

  vote(input: VoteIntentParams): this {
    return this.setAction("vote", input.targetProgram, input.method ?? "vote", input.params, input.constraints);
  }

  generic(input: GenericIntentParams): this {
    return this.setAction(
      input.actionType ?? "generic",
      input.targetProgram,
      input.method,
      input.params,
      input.constraints
    );
  }

  private setAction(
    actionType: ActionType,
    targetProgram: PublicKey,
    method: string,
    params: JsonValue,
    constraints?: JsonValue
  ): this {
    this.intent.actionType = actionType;
    this.intent.targetProgram = targetProgram;
    this.intent.method = method;
    this.intent.params = params;
    this.intent.constraints = constraints ?? {};
    return this;
  }

  build(): Intent {
    return { ...this.intent };
  }
}
