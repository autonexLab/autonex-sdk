import { sha256 } from "@noble/hashes/sha256";
import type { Policy } from "../types/core.js";
import { AutonexError } from "../types/core.js";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",")}}`;
}

export function canonicalPolicyMessage(policy: Policy): Uint8Array {
  const payload = {
    financialRules: {
      maxTxAmountLamports: policy.financialRules.maxTxAmountLamports?.toString(),
      dailyLimitLamports: policy.financialRules.dailyLimitLamports?.toString(),
      maxSlippageBps: policy.financialRules.maxSlippageBps,
    },
    timeRules: policy.timeRules.timeWindow
      ? {
          startHourUtc: policy.timeRules.timeWindow.startHourUtc,
          endHourUtc: policy.timeRules.timeWindow.endHourUtc,
        }
      : null,
    protocolRules: {
      allowProtocols: policy.protocolRules.allowProtocols?.map((p) => p.toBase58()) ?? [],
      allowMethods: policy.protocolRules.allowMethods ?? [],
    },
    riskRules: policy.riskRules,
  };

  return new TextEncoder().encode(stableStringify(payload));
}

export function policyHash(policy: Policy): Uint8Array {
  return sha256(canonicalPolicyMessage(policy));
}

export class PolicyValidator {
  static assertValid(policy: Policy | undefined): asserts policy is Policy {
    if (!policy) throw new AutonexError("POLICY_MISSING", "Policy is required");

    const { financialRules, timeRules, protocolRules } = policy;

    if (financialRules.maxSlippageBps != null) {
      if (!Number.isInteger(financialRules.maxSlippageBps) || financialRules.maxSlippageBps < 0) {
        throw new AutonexError("POLICY_INVALID", "maxSlippageBps must be a non-negative integer");
      }
    }

    if (timeRules.timeWindow) {
      const { startHourUtc, endHourUtc } = timeRules.timeWindow;
      if (![startHourUtc, endHourUtc].every((x) => Number.isInteger(x) && x >= 0 && x <= 23)) {
        throw new AutonexError("POLICY_INVALID", "timeWindow hours must be integers in [0, 23]");
      }
    }

    // Enforce policy presence of protocol allowlisting to prevent arbitrary CPI targets.
    if (!protocolRules.allowProtocols || protocolRules.allowProtocols.length === 0) {
      throw new AutonexError(
        "POLICY_INVALID",
        "protocolRules.allowProtocols must be provided to prevent arbitrary CPI targets"
      );
    }
  }
}
