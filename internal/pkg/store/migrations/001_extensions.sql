CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Activate vector support infrastructure
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Build explicit tracking table context mapping 
CREATE TABLE IF NOT EXISTS document_embeddings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content     TEXT NOT NULL,
    embedding   vector(1536) NOT NULL, -- Configured for standard 1536-dim vectors
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure chunk uniqueness parameters are safe
    CONSTRAINT unique_doc_chunk UNIQUE(document_id, chunk_index)
);

-- 3. Provision cosine distance index for blazing-fast similarity checks
CREATE INDEX IF NOT EXISTS document_embeddings_vector_idx 
ON document_embeddings USING hnsw (embedding vector_cosine_ops);
