import type { Agent } from "../types/core.js";

export class AgentRecord {
  constructor(readonly value: Agent) {}

  isActive(): boolean {
    return this.value.status === "active";
  }
}
