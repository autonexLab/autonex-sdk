import type { PublicKey } from "@solana/web3.js";

export type TimeWindow = { startHourUtc: number; endHourUtc: number };

export type PolicyBuildInput = {
  maxTxAmountLamports?: bigint;
  dailyLimitLamports?: bigint;
  maxSlippageBps?: number;
  allowProtocols?: PublicKey[];
  allowMethods?: string[];
  timeWindow?: TimeWindow;
  maxRiskScore?: number;
};
