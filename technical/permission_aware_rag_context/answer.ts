interface Subject {
  tenantId: string;
  userId: string;
  roles: readonly string[];
}

interface RetrievalFilter {
  tenantId: string;
  allowedRolesAnyOf: readonly string[];
  includeTenantVisible: boolean;
}

interface RetrievedChunk {
  id: string;
  documentTitle: string;
  text: string;
}

interface SearchBackend {
  search(query: string, filter: RetrievalFilter, limit: number): Promise<RetrievedChunk[]>;
}

interface ContextItem {
  sourceId: string;
  title: string;
  text: string;
}

async function buildContext(
  backend: SearchBackend,
  subject: Subject,
  query: string,
  limit: number,
): Promise<ContextItem[]> {
  // Candidate implementation
  throw new Error("not implemented");
}
