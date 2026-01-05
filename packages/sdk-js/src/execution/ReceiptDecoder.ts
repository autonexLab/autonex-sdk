import { sha256 } from "@noble/hashes/sha256";
import { PublicKey } from "@solana/web3.js";
import type { ExecutionReceipt, ExecutionStatus } from "../types/core.js";
import { AutonexError } from "../types/core.js";

// Receipt binary format (v0):
// [0] u8 version
// [1..33) agentId (32)
// [33..65) policyHash (32)
// [65..73) timestampUnixMs i64 LE
// [73] u8 status (0 success,1 rejected,2 failed)
// [74..76) u16 errorLen LE
// [..] error bytes UTF-8
// executionHash is computed deterministically from the fields above.

function readI64LE(bytes: Uint8Array, offset: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const low = view.getUint32(offset, true);
  const high = view.getInt32(offset + 4, true);
  return high * 2 ** 32 + low;
}

function computeExecutionHash(
  agentId: PublicKey,
  policyHash: Uint8Array,
  timestampUnixMs: number,
  status: ExecutionStatus,
  error?: string
): Uint8Array {
  const statusByte = status === "success" ? 0 : status === "rejected" ? 1 : 2;
  const errBytes = error ? new TextEncoder().encode(error) : new Uint8Array();
  const payload = new Uint8Array(32 + 32 + 8 + 1 + errBytes.length);
  payload.set(agentId.toBytes(), 0);
  payload.set(policyHash, 32);
  const view = new DataView(payload.buffer);
  // i64 LE
  const low = timestampUnixMs >>> 0;
  const high = Math.floor(timestampUnixMs / 2 ** 32);
  view.setUint32(64, low, true);
  view.setInt32(68, high, true);
  payload[72] = statusByte;
  payload.set(errBytes, 73);
  return sha256(payload);
}

export class ReceiptDecoder {
  decode(data: Uint8Array): ExecutionReceipt {
    if (data.length < 76) {
      throw new AutonexError("RECEIPT_INVALID", "Receipt too short");
    }
    const version = data[0];
    if (version !== 0) {
      throw new AutonexError("RECEIPT_INVALID", `Unsupported receipt version: ${version}`);
    }

    const agentId = new PublicKey(data.slice(1, 33));
    const policyHash = data.slice(33, 65);
    const timestampUnixMs = readI64LE(data, 65);
    const statusByte = data[73];
    const status: ExecutionStatus = statusByte === 0 ? "success" : statusByte === 1 ? "rejected" : "failed";

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const errorLen = view.getUint16(74, true);
    const errorStart = 76;
    const errorEnd = errorStart + errorLen;
    if (errorEnd > data.length) {
      throw new AutonexError("RECEIPT_INVALID", "Invalid error length");
    }
    const error = errorLen > 0 ? new TextDecoder().decode(data.slice(errorStart, errorEnd)) : undefined;

    const executionHash = computeExecutionHash(agentId, policyHash, timestampUnixMs, status, error);

    return {
      executionHash,
      agentId,
      policyHash,
      timestampUnixMs,
      status,
      error,
    };
  }

  verifyDeterministicFields(receipt: ExecutionReceipt): void {
    const expected = computeExecutionHash(
      receipt.agentId,
      receipt.policyHash,
      receipt.timestampUnixMs,
      receipt.status,
      receipt.error
    );

    const same = expected.length === receipt.executionHash.length && expected.every((b, i) => b === receipt.executionHash[i]);
    if (!same) {
      throw new AutonexError("RECEIPT_INVALID", "Receipt deterministic fields verification failed");
    }
  }
}
