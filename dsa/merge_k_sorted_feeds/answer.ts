export interface FeedEvent { timestamp: number; payload: string; }
export function mergeSortedFeeds(
  feeds: readonly (readonly FeedEvent[])[],
): FeedEvent[] {
  throw new Error("not implemented");
}
