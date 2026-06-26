export interface SeedContext {
  executedAt: Date;
  actor: string;
}

export function createSeedContext(actor = "system"): SeedContext {
  return {
    executedAt: new Date(),
    actor
  };
}
