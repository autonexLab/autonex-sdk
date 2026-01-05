import type { Agent } from "../types/core.js";

export class AgentRegistry {
  private readonly agents = new Map<string, Agent>();

  upsert(agent: Agent): void {
    this.agents.set(agent.agentId.toBase58(), agent);
  }

  get(agentIdBase58: string): Agent | undefined {
    return this.agents.get(agentIdBase58);
  }

  list(): Agent[] {
    return Array.from(this.agents.values());
  }
}
