import type { PublicKey } from "@solana/web3.js";
import type { Policy } from "../types/core.js";
import type { PolicyBuildInput, TimeWindow } from "./PolicyRules.js";

export class PolicyBuilder {
  private input: PolicyBuildInput = {};

  maxTxAmount(lamports: number | bigint): this {
    this.input.maxTxAmountLamports = BigInt(lamports);
    return this;
  }

  dailyLimit(lamports: number | bigint): this {
    this.input.dailyLimitLamports = BigInt(lamports);
    return this;
  }

  allowProtocols(protocols: PublicKey[]): this {
    this.input.allowProtocols = protocols;
    return this;
  }

  allowMethods(methods: string[]): this {
    this.input.allowMethods = methods;
    return this;
  }

  maxSlippage(bps: number): this {
    this.input.maxSlippageBps = bps;
    return this;
  }

  timeWindow(window: TimeWindow): this {
    this.input.timeWindow = window;
    return this;
  }

  maxRiskScore(score: number): this {
    this.input.maxRiskScore = score;
    return this;
  }

  build(): Policy {
    return {
      financialRules: {
        maxTxAmountLamports: this.input.maxTxAmountLamports,
        dailyLimitLamports: this.input.dailyLimitLamports,
        maxSlippageBps: this.input.maxSlippageBps,
      },
      timeRules: {
        timeWindow: this.input.timeWindow,
      },
      protocolRules: {
        allowProtocols: this.input.allowProtocols,
        allowMethods: this.input.allowMethods,
      },
      riskRules: {
        maxRiskScore: this.input.maxRiskScore,
      },
    };
  }
}
