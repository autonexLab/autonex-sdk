import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import type { Intent } from "../src/types/core.js";
import { canonicalIntentMessage } from "../src/intent/IntentValidator.js";

export function makeAgentKeypair(): { publicKey: PublicKey; secretKey: Uint8Array } {
  const kp = nacl.sign.keyPair();
  return { publicKey: new PublicKey(kp.publicKey), secretKey: kp.secretKey };
}

export function signIntent(intent: Omit<Intent, "signature">, secretKey: Uint8Array): Uint8Array {
  const msg = canonicalIntentMessage(intent);
  return nacl.sign.detached(msg, secretKey);
}
