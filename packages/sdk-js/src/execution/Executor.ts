import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Buffer } from "node:buffer";
import type { Intent, Policy } from "../types/core.js";
import { AutonexError } from "../types/core.js";
import { Simulator } from "../simulation/Simulator.js";
import { policyHash } from "../policy/PolicyValidator.js";
import { intentHash } from "../intent/IntentValidator.js";

export interface TransactionSigner {
  publicKey: PublicKey;
  signTransaction(tx: VersionedTransaction): Promise<VersionedTransaction>;
}

export type ExecuteOptions = {
  signer: TransactionSigner;
  recentBlockhash?: string;
};

export class Executor {
  constructor(
    private readonly connection: Connection,
    private readonly programId: PublicKey,
    private readonly simulator: Simulator
  ) {}

  async execute(intent: Intent, policy: Policy, options: ExecuteOptions): Promise<{ signature: string }> {
    // Mandatory rule: execution MUST fail if simulation is skipped.
    // This method always simulates and will reject if simulation fails.
    const sim = await this.simulator.simulate(intent, policy);
    if (!sim.allowed) {
      throw new AutonexError("SIMULATION_REJECTED", `Simulation rejected: ${sim.reason}`);
    }

    const ix = this.buildAutonexInstruction(intent, policy);
    const latest = options.recentBlockhash
      ? { blockhash: options.recentBlockhash, lastValidBlockHeight: 0 }
      : await this.connection.getLatestBlockhash();

    const msg = new TransactionMessage({
      payerKey: options.signer.publicKey,
      recentBlockhash: latest.blockhash,
      instructions: [ix],
    }).compileToV0Message();

    const tx = new VersionedTransaction(msg);
    const signed = await options.signer.signTransaction(tx);

    const sig = await this.connection.sendTransaction(signed, { skipPreflight: false });
    return { signature: sig };
  }

  private buildAutonexInstruction(intent: Intent, policy: Policy): TransactionInstruction {
    const ih = intentHash({ ...intent, signature: undefined } as Omit<Intent, "signature">);
    const ph = policyHash(policy);
    // Deterministic payload for the on-chain AUTONEX program.
    // Format: ["AUTONEX", 0u8, intentHash(32), policyHash(32)]
    const header = new TextEncoder().encode("AUTONEX");
    const data = new Uint8Array(header.length + 1 + 32 + 32);
    data.set(header, 0);
    data[header.length] = 0;
    data.set(ih, header.length + 1);
    data.set(ph, header.length + 1 + 32);

    return new TransactionInstruction({
      programId: this.programId,
      keys: [],
      data: Buffer.from(data),
    });
  }
}
