* **Current chunking problem**

  * Fixed character slicing
  * Ignores document structure
  * Can split sentences, headings, tables, OCR noise

* **Parsing vs chunking**

  * Tables/scanned PDFs likely have extraction/parsing issues first
  * Poor Recall@5 for tables/scans suggests structure loss, not just bad chunk size
  * Separate extraction quality from chunk-boundary quality

* **Lost structure**

  * No headings
  * No page references
  * No section hierarchy
  * No table boundaries
  * Weak citation lineage

* **Overlap risk**

  * 400 overlap on 1200 size is large
  * Causes duplicated context
  * 28% duplicate chunks in top 5 supports this
  * Wastes context budget
  * Can hurt citation precision

* **Chunk identity problem**

  * ID uses character offset
  `"id": f"{document_id}:{start}"`
  * Small edit near top changes downstream offsets
  * Causes unstable IDs
  * Hurts incremental reindexing, caching, updates, and lineage

* **Bounded first improvement**

  * Add a lightweight format-aware normalization layer
  * Do not build one giant parser
  * Emit common blocks like:

    * section
    * paragraph
    * table
    * page
  * Then chunk those blocks

* **Plain text strategy**

  * Split on paragraph/sentence boundaries
  * Group blocks up to a target token range
  * Avoid arbitrary character cuts

* **Table strategy**

  * Keep table logically together when possible
  * Preserve headers
  * If splitting rows, repeat column headers
  * Keep table/page lineage

* **Scanned PDF strategy**

  * OCR/layout extraction first
  * Preserve page number
  * Preserve reading order/layout metadata
  * Clean obvious OCR artifacts before chunking

* **Frequently edited docs**

  * Use structural/block identity
  * Combine stable section/block ID with content hash
  * Avoid raw character offsets

* **Overlap improvement**

  * Reduce fixed overlap
  * Prefer semantic overlap
  * Example: previous heading or paragraph
  * Deduplicate similar/adjacent chunks before context assembly

* **Metadata on every chunk**

  * document_id
  * document_version
  * tenant/security scope
  * page number
  * section path
  * element type
  * source URI/reference
  * ingestion/version lineage

* **Security**

  * Security metadata must propagate to every chunk
  * Apply tenant/ACL filtering during retrieval
  * Never rely only on application-layer filtering afterward

* **Evaluation**

  * Compare old vs new offline
  * Evaluate separately by cohort:

    * plain text
    * tables
    * scanned PDFs
    * frequently edited docs
  * Avoid subjective spot checking only

* **Metrics**

  * Recall@5
  * citation correction/error rate
  * duplicate chunks in top-k
  * retrieved token count
  * answer correctness
  * citation correctness
  * reindex churn after small edits

* **Success criteria**

  * Keep plain-text performance flat or better
  * Improve table and scanned-PDF recall
  * Reduce duplicate retrieval
  * Improve citation precision
  * Reduce unnecessary reindexing after small edits