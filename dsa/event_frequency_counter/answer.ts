export interface EventFrequency {
  event: string;
  count: number;
}

export function mostFrequentEvent(
  events: readonly string[],
): EventFrequency | null {
  throw new Error("not implemented");
}
