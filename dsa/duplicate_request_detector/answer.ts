export function firstDuplicateRequest(
  requestIds: readonly string[],
): string | null {
  const seen = new Set<string>();

  for (const id of requestIds) {
      if (seen.has(id)) {
      return id;
      }

      seen.add(id);
  }

  return null;
}
