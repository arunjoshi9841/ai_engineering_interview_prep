export interface EventFrequency {
  event: string;
  count: number;
}

export function mostFrequentEvent(
  events: readonly string[],
): EventFrequency | null {
  if (events.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();

  for (const event of events) {
    counts.set(
      event,
      (counts.get(event) ?? 0) + 1,
    );
  }

  let highestEvent: string | null = null;
  let highestCount = 0;

  for (const [event, count] of counts) {
    if (count > highestCount) {
      highestEvent = event;
      highestCount = count;
    }
  }

  if (highestEvent === null) {
    return null;
  }

  return {
    event: highestEvent,
    count: highestCount,
  };
}