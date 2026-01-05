import type { Intent, Policy, SimulationResult } from "../types/core.js";
import { AutonexError } from "../types/core.js";
import { IntentValidator } from "../intent/IntentValidator.js";
import { PolicyValidator } from "../policy/PolicyValidator.js";

export class Simulator {
  async simulate(intent: Intent, policy: Policy): Promise<SimulationResult> {
    try {
      PolicyValidator.assertValid(policy);
      IntentValidator.assertValid(intent);

      const allowedProtocols = policy.protocolRules.allowProtocols ?? [];
      const allowedMethods = policy.protocolRules.allowMethods ?? [];

      const programAllowed = allowedProtocols.some((p) => p.equals(intent.targetProgram));
      if (!programAllowed) {
        return { allowed: false, reason: "Target program is not allowlisted by policy" };
      }

      if (allowedMethods.length > 0 && !allowedMethods.includes(intent.method)) {
        return { allowed: false, reason: "Method is not allowlisted by policy" };
      }

      // Financial/time/risk rules are intentionally conservative by default.
      // Applications can extend params/constraints schema while keeping these invariants.
      return { allowed: true, reason: "Allowed" };
    } catch (e) {
      if (e instanceof AutonexError) return { allowed: false, reason: `${e.code}: ${e.message}` };
      return { allowed: false, reason: "Unknown simulation error" };
    }
  }
}
