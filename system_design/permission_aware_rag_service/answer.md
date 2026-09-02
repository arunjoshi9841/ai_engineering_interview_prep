# Permission-Aware RAG Service

**Interviewer:** Design a RAG service that answers employee questions from enterprise documents while respecting permissions.

**Me:** The key principle is that authorization happens before content reaches the model. Filtering the final answer is too late because the restricted text has already been exposed to the model and possibly to logs or caches.

I would keep the source repositories authoritative. An ingestion service would read documents and store their content, source ID, version, owner, classification, ACL information, and deletion status. It would create chunks with document and page references, then update a lexical index and a vector index asynchronously.

At query time, the request includes the authenticated user, tenant, groups, role, use case, and possibly region. An authorization service turns that trusted context into a retrieval filter. The retrieval layer applies the filter while searching, using both keyword search and semantic search. Keyword search matters for exact policy numbers, account codes, and identifiers. Vector search helps with natural-language questions.

I would verify access again before assembling the model context, especially if permissions can change independently of document content. The context would contain only authorized chunks. Each chunk would carry citation metadata such as document ID, version, title if safe to display, and page or section.

The model would receive a clear instruction to answer only from the supplied evidence. If the evidence is missing, contradictory, stale, or below a confidence threshold, the service should say that it cannot answer reliably or ask the user to contact the right owner. It should not fill the gap from general knowledge.

For a policy update whose new version is not indexed yet, I would check the source version and index freshness. For high-impact policies, it may be safer to query the source directly or return a freshness warning than to serve an older version silently. When a document is deleted or access is revoked, tombstones and ACL-change events should remove it from active retrieval quickly. Caches must also include tenant and permission context, or be disabled for sensitive content.

I would measure retrieval separately from answer quality. Retrieval metrics include recall, precision, freshness, and unauthorized-result rate. Answer metrics include citation correctness, groundedness, completeness, and user corrections. This tells us whether a bad answer came from missing evidence, ranking, context assembly, or generation.

The service also needs protection against prompt injection inside documents. Retrieved text is data, not instructions. The model should not be allowed to change tools, permissions, or system behavior because a document says so.

**Interviewer:** How do you handle a permission revocation while the index is eventually consistent?

**Me:** I would make permission changes a high-priority invalidation path. The serving layer can check a current authorization service before returning a chunk, and sensitive documents can use a source-of-truth check. If freshness cannot be guaranteed, I would fail closed for that content rather than risk leakage.
