import nacl from "tweetnacl";
import { sha256 } from "@noble/hashes/sha256";
import type { Intent } from "../types/core.js";
import { AutonexError } from "../types/core.js";

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",")}}`;
}

export function canonicalIntentMessage(intent: Omit<Intent, "signature">): Uint8Array {
  const payload = {
    agentId: intent.agentId.toBase58(),
    actionType: intent.actionType,
    targetProgram: intent.targetProgram.toBase58(),
    method: intent.method,
    params: intent.params,
    constraints: intent.constraints,
    expirationUnixMs: intent.expirationUnixMs,
    nonce: intent.nonce,
  };

  return new TextEncoder().encode(stableStringify(payload));
}

export function intentHash(intent: Omit<Intent, "signature">): Uint8Array {
  return sha256(canonicalIntentMessage(intent));
}

export class IntentValidator {
  static assertValid(intent: Intent, nowUnixMs: number = Date.now()): void {
    if (!intent.signature || intent.signature.length === 0) {
      throw new AutonexError("INTENT_UNSIGNED", "Intent is unsigned");
    }
    if (!intent.nonce) {
      throw new AutonexError("INTENT_INVALID", "Intent nonce is required");
    }
    if (!intent.method) {
      throw new AutonexError("INTENT_INVALID", "Intent method is required");
    }
    if (intent.expirationUnixMs <= nowUnixMs) {
      throw new AutonexError("INTENT_EXPIRED", "Intent is expired", {
        expirationUnixMs: intent.expirationUnixMs,
        nowUnixMs,
      });
    }

    const msg = canonicalIntentMessage({ ...intent, signature: undefined } as Omit<Intent, "signature">);
    const pubkeyBytes = intent.agentId.toBytes();
    const ok = nacl.sign.detached.verify(msg, intent.signature, pubkeyBytes);
    if (!ok) {
      throw new AutonexError("INTENT_INVALID", "Intent signature verification failed");
    }
  }
}
