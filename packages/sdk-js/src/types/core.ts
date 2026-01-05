import type { PublicKey } from "@solana/web3.js";

export type AgentStatus = "active" | "paused" | "revoked";

export interface Agent {
  agentId: PublicKey;
  role: string;
  permissions: string[];
  status: AgentStatus;
}

export type ActionType = "swap" | "transfer" | "stake" | "vote" | "generic";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [k: string]: JsonValue };

export interface Intent {
  agentId: PublicKey;
  actionType: ActionType;
  targetProgram: PublicKey;
  method: string;
  params: JsonValue;
  constraints: JsonValue;
  expirationUnixMs: number;
  nonce: string;
  signature?: Uint8Array;
}

export interface FinancialRules {
  maxTxAmountLamports?: bigint;
  dailyLimitLamports?: bigint;
  maxSlippageBps?: number;
}

export interface TimeWindowRule {
  startHourUtc: number;
  endHourUtc: number;
}

export interface TimeRules {
  timeWindow?: TimeWindowRule;
}

export interface ProtocolRules {
  allowProtocols?: PublicKey[];
  allowMethods?: string[];
}

export interface RiskRules {
  maxRiskScore?: number;
}

export interface Policy {
  financialRules: FinancialRules;
  timeRules: TimeRules;
  protocolRules: ProtocolRules;
  riskRules: RiskRules;
}

export type ExecutionStatus = "success" | "rejected" | "failed";

export interface ExecutionReceipt {
  executionHash: Uint8Array;
  agentId: PublicKey;
  policyHash: Uint8Array;
  timestampUnixMs: number;
  status: ExecutionStatus;
  error?: string;
}

export interface SimulationResult {
  allowed: boolean;
  reason: string;
}

export class AutonexError extends Error {
  readonly code:
    | "INTENT_UNSIGNED"
    | "INTENT_EXPIRED"
    | "POLICY_MISSING"
    | "TARGET_PROGRAM_NOT_ALLOWED"
    | "METHOD_NOT_ALLOWED"
    | "POLICY_INVALID"
    | "INTENT_INVALID"
    | "SIMULATION_REJECTED"
    | "RECEIPT_INVALID"
    | "EXECUTION_FAILED";

  constructor(
    code: AutonexError["code"],
    message: string,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "AutonexError";
    this.code = code;
  }
}
