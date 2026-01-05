import { describe, expect, it } from "vitest";
import { PublicKey } from "@solana/web3.js";
import { ReceiptDecoder } from "../src/execution/ReceiptDecoder.js";

function writeI64LE(out: Uint8Array, offset: number, value: number) {
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  const low = value >>> 0;
  const high = Math.floor(value / 2 ** 32);
  view.setUint32(offset, low, true);
  view.setInt32(offset + 4, high, true);
}

describe("ReceiptDecoder", () => {
  it("decodes and verifies deterministic fields", () => {
    const decoder = new ReceiptDecoder();

    const agentId = new PublicKey("11111111111111111111111111111111");
    const policyHash = new Uint8Array(32);
    policyHash[0] = 7;

    const timestamp = 1700000000000;
    const statusByte = 0; // success
    const error = "";

    const errorBytes = new TextEncoder().encode(error);
    const buf = new Uint8Array(76 + errorBytes.length);
    buf[0] = 0; // version
    buf.set(agentId.toBytes(), 1);
    buf.set(policyHash, 33);
    writeI64LE(buf, 65, timestamp);
    buf[73] = statusByte;
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    view.setUint16(74, errorBytes.length, true);

    const receipt = decoder.decode(buf);
    expect(receipt.agentId.toBase58()).toBe(agentId.toBase58());

    expect(() => decoder.verifyDeterministicFields(receipt)).not.toThrow();

    // Tamper
    const tampered = { ...receipt, executionHash: receipt.executionHash.slice() };
    tampered.executionHash[0] ^= 0xff;
    expect(() => decoder.verifyDeterministicFields(tampered)).toThrow(/verification failed/i);
  });
});
