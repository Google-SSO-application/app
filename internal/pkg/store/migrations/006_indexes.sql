CREATE INDEX IF NOT EXISTS idx_users_role_name
    ON users (role, name);

CREATE INDEX IF NOT EXISTS idx_projects_created_by
    ON projects (created_by);

CREATE INDEX IF NOT EXISTS idx_documents_owner_id_created_at
    ON documents (owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_reviewer_id_created_at
    ON documents (reviewer_id, created_at DESC)
    WHERE reviewer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_id_reviewer_id
    ON documents (id, reviewer_id)
    WHERE reviewer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_status_published
    ON documents (project_id, created_at DESC)
    WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_documents_project_id
    ON documents (project_id)
    WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id
    ON document_tags (tag_id);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id
    ON document_embeddings (document_id);
    
CREATE INDEX IF NOT EXISTS document_embeddings_vector_idx 
ON document_embeddings USING hnsw (embedding vector_cosine_ops);