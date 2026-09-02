# Multiformat Ingestion Platform

**Interviewer:** Design a platform that turns PDFs, office files, images, and text into searchable content.

**Me:** I would build this as a staged, asynchronous pipeline. The source system remains authoritative, and we publish a document version only after every required stage has completed successfully.

An upload or connector event would include the tenant, document identity, source version, permissions, and an idempotency key. The intake service validates the event, stores the original file in immutable object storage, and creates a processing record. A checksum helps detect duplicate content and repeated deliveries.

The pipeline could be:

`received -> scanned -> parsed -> normalized -> chunked -> embedded -> published`

Each stage gets its own queue and retry policy. Workers claim jobs with leases, so a crashed worker does not leave work stuck forever. Large OCR jobs should use a separate resource class and concurrency limit. Otherwise, a few 500 MB scans could starve normal documents.

Before parsing, I would virus-scan the file and apply limits on size, pages, decompression, and processing time. Format-specific parsers would preserve page numbers, headings, tables where possible, and source metadata. OCR output should include confidence so downstream users know when text was inferred rather than directly extracted.

Every stage output would be immutable and identified by its input version, code version, and configuration. A lineage record connects the source version to the parser, OCR engine, chunker, embedding model, and index version. If the chunker changes, we can replay from normalized text instead of rerunning OCR.

Publication should be atomic from the searcher's perspective. I would write chunks under a private manifest, verify the expected counts and checksums, and then switch an active pointer to that complete manifest. Old versions can be cleaned up later. A late completion for version 8 must not replace the active pointer for version 9, so updates need version checks or fencing tokens.

Deletes and permission changes need their own high-priority path. A deleted document should be removed from active search promptly, even if physical cleanup happens later. Permission metadata must be attached before publication, and retrieval should enforce it again.

The status API should show progress and useful failure information such as `ocr_timeout`, `unsupported_format`, or `parser_error`, without exposing document contents in logs or dead-letter messages.

**Interviewer:** How would you handle an embedding model migration?

**Me:** I would build a new index in parallel with a new embedding version. The active pointer remains on the old complete index until the new one passes validation. Then I switch the pointer atomically and clean up the old index later. That avoids downtime and prevents mixed embedding versions from producing confusing search behavior.

**Interviewer:** What if events arrive out of order?

**Me:** I would persist the latest known source version and reject or quarantine older events that arrive late. The processing record would be fenced by source version, so an older job cannot publish over newer content.
