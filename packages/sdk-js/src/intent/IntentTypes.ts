import type { PublicKey } from "@solana/web3.js";
import type { ActionType, Intent, JsonValue } from "../types/core.js";

export type SwapIntentParams = {
  targetProgram: PublicKey;
  method?: string;
  params: JsonValue;
  constraints?: JsonValue;
  expirationUnixMs: number;
};

export type TransferIntentParams = {
  targetProgram: PublicKey;
  method?: string;
  params: JsonValue;
  constraints?: JsonValue;
  expirationUnixMs: number;
};

export type StakeIntentParams = {
  targetProgram: PublicKey;
  method?: string;
  params: JsonValue;
  constraints?: JsonValue;
  expirationUnixMs: number;
};

export type VoteIntentParams = {
  targetProgram: PublicKey;
  method?: string;
  params: JsonValue;
  constraints?: JsonValue;
  expirationUnixMs: number;
};

export type GenericIntentParams = {
  actionType?: ActionType;
  targetProgram: PublicKey;
  method: string;
  params: JsonValue;
  constraints?: JsonValue;
  expirationUnixMs: number;
};

export type BuiltIntent = Intent;
