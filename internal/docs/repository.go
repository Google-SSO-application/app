package docs

import (
	"context"
	"errors"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pgvector/pgvector-go"
)

type Repository interface {
	CreateDocument(ctx context.Context, doc *types.Document, filePath string) error
	GetDocsByOwner(ctx context.Context, ownerID uuid.UUID) ([]types.Document, error)
	AssignReviewer(ctx context.Context, docID uuid.UUID, reviewerID uuid.UUID) error
	RemoveReviewer(ctx context.Context, docID uuid.UUID) error
	GetByID(ctx context.Context, docID uuid.UUID) (*types.Document, error)
	ListReviewDocs(ctx context.Context, reviewerID uuid.UUID) ([]types.Document, error)
	UpdateReviewStatus(ctx context.Context, docID, reviewerID uuid.UUID, status string) error
	ListAllTags(ctx context.Context) ([]types.Tag, error)
	CreateTag(ctx context.Context, name string) (*types.Tag, error)
	AddTagToDocument(ctx context.Context, docID uuid.UUID, tagName string) error
	GetTagsByDocID(ctx context.Context, docID uuid.UUID) ([]string, error)
	GetUploadsCount(ctx context.Context, ownerID uuid.UUID) (int, error)
	PublishDocumentWithVector(ctx context.Context, docID, reviewerID uuid.UUID, status string, content string, vectorValues []float32) error
	FindByVectorSimilarity(ctx context.Context, vectorValues []float32, limit int) ([]types.Document, []float64, error)
	GetPublishedCountsByProject(ctx context.Context) (map[string]int, error)
	GetPublishedByProject(ctx context.Context, projectName string) ([]types.Document, error)
}

type PostgresRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

func (r *PostgresRepository) CreateDocument(ctx context.Context, doc *types.Document, filePath string) error {
	query := `
		WITH project AS (
			INSERT INTO projects (name, created_by)
			VALUES ($9, $10)
			ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		)
		INSERT INTO documents (project_id, owner_id, reviewer_id, title, file_type, file_path, file_name, status)
		VALUES (COALESCE($1, (SELECT id FROM project)), $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, project_id, created_at, updated_at;`

	return r.pool.QueryRow(ctx, query,
		doc.ProjectID, doc.OwnerID, doc.ReviewerID, doc.Title, doc.FileType, filePath, doc.FileName, doc.Status, doc.ProjectName, doc.OwnerID,
	).Scan(&doc.ID, &doc.ProjectID, &doc.CreatedAt, &doc.UpdatedAt)
}

func (r *PostgresRepository) GetDocsByOwner(ctx context.Context, ownerID uuid.UUID) ([]types.Document, error) {
	query := `
		SELECT d.id, d.project_id, COALESCE(p.name, ''),
		       d.owner_id, d.reviewer_id,
		       COALESCE(u.name, ''), COALESCE(u.email, ''), COALESCE(u.picture, ''),
		       d.title, d.file_type, d.file_name,
		       d.status, d.created_at, d.updated_at,
		       COALESCE((
					SELECT ARRAY_AGG(t.name ORDER BY t.name)
					FROM document_tags dt
					JOIN tags t ON t.id = dt.tag_id
					WHERE dt.document_id = d.id
				), '{}')
		FROM documents d
		LEFT JOIN projects p ON p.id = d.project_id
		LEFT JOIN users u ON u.id = d.reviewer_id
		WHERE d.owner_id = $1
		ORDER BY d.created_at DESC;`

	rows, err := r.pool.Query(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	docs := make([]types.Document, 0)
	for rows.Next() {
		var d types.Document
		err := rows.Scan(&d.ID, &d.ProjectID, &d.ProjectName, &d.OwnerID, &d.ReviewerID, &d.ReviewerName, &d.ReviewerEmail, &d.ReviewerPicture, &d.Title, &d.FileType, &d.FileName, &d.Status, &d.CreatedAt, &d.UpdatedAt, &d.Tags)
		if err != nil {
			return nil, err
		}
		docs = append(docs, d)
	}
	return docs, nil
}

func (r *PostgresRepository) AssignReviewer(ctx context.Context, docID uuid.UUID, reviewerID uuid.UUID) error {
	const query = `
		UPDATE documents
		SET reviewer_id = $1, updated_at = NOW()
		WHERE id = $2`

	commandTag, err := r.pool.Exec(ctx, query, reviewerID, docID)
	if err != nil {
		return err
	}

	if commandTag.RowsAffected() == 0 {
		return ErrDocumentNotFound
	}
	return nil
}

func (r *PostgresRepository) RemoveReviewer(ctx context.Context, docID uuid.UUID) error {
	const query = `
		UPDATE documents
		SET reviewer_id = NULL, updated_at = NOW()
		WHERE id = $1`

	commandTag, err := r.pool.Exec(ctx, query, docID)
	if err != nil {
		return err
	}

	if commandTag.RowsAffected() == 0 {
		return ErrDocumentNotFound
	}
	return nil
}

func (r *PostgresRepository) GetByID(ctx context.Context, docID uuid.UUID) (*types.Document, error) {
	const query = `
		SELECT d.id, d.project_id, COALESCE(p.name, '') as project_name,
		       d.owner_id, d.reviewer_id,
		       COALESCE(u.name, ''), COALESCE(u.email, ''), COALESCE(u.picture, ''),
		       d.title, d.file_type, d.file_name,
		       d.file_path,
		       d.status, d.created_at, d.updated_at
		FROM documents d
		LEFT JOIN projects p ON p.id = d.project_id
		LEFT JOIN users u ON u.id = d.reviewer_id
		WHERE d.id = $1`

	doc := &types.Document{}
	err := r.pool.QueryRow(ctx, query, docID).Scan(
		&doc.ID,
		&doc.ProjectID,
		&doc.ProjectName,
		&doc.OwnerID,
		&doc.ReviewerID,
		&doc.ReviewerName,
		&doc.ReviewerEmail,
		&doc.ReviewerPicture,
		&doc.Title,
		&doc.FileType,
		&doc.FileName,
		&doc.FilePath,
		&doc.Status,
		&doc.CreatedAt,
		&doc.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return doc, nil
}

func (r *PostgresRepository) ListReviewDocs(ctx context.Context, reviewerID uuid.UUID) ([]types.Document, error) {
	query := `
		SELECT d.id, d.project_id, COALESCE(p.name, ''),
		       d.owner_id, d.reviewer_id,
		       COALESCE(u.name, ''), COALESCE(u.email, ''), COALESCE(u.picture, ''),
		       d.title, d.file_type, d.file_name,
		       d.status, d.created_at, d.updated_at,
		       COALESCE((
					SELECT ARRAY_AGG(t.name ORDER BY t.name)
					FROM document_tags dt
					JOIN tags t ON t.id = dt.tag_id
					WHERE dt.document_id = d.id
				), '{}')
		FROM documents d
		LEFT JOIN projects p ON p.id = d.project_id
		LEFT JOIN users u ON u.id = d.reviewer_id
		WHERE d.reviewer_id = $1
		ORDER BY d.created_at DESC;`

	rows, err := r.pool.Query(ctx, query, reviewerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	docs := make([]types.Document, 0)
	for rows.Next() {
		var d types.Document
		err := rows.Scan(
			&d.ID, &d.ProjectID, &d.ProjectName, &d.OwnerID, &d.ReviewerID,
			&d.ReviewerName, &d.ReviewerEmail, &d.ReviewerPicture, 
			&d.Title, &d.FileType, &d.FileName, &d.Status, &d.CreatedAt, &d.UpdatedAt, 
			&d.Tags,
		)
		if err != nil {
			return nil, err
		}
		docs = append(docs, d)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return docs, nil
}

func (r *PostgresRepository) UpdateReviewStatus(ctx context.Context, docID, reviewerID uuid.UUID, status string) error {
	const query = `
		UPDATE documents
		SET status = $1, updated_at = NOW()
		WHERE id = $2 AND reviewer_id = $3`
	commandTag, err := r.pool.Exec(ctx, query, status, docID, reviewerID)
	if err != nil {
		return err
	}
	if commandTag.RowsAffected() == 0 {
		return ErrDocumentNotFound
	}
	return nil
}

func (r *PostgresRepository) ListAllTags(ctx context.Context) ([]types.Tag, error) {
	const query = `SELECT id, name, created_at FROM tags ORDER BY name ASC;`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []types.Tag
	for rows.Next() {
		var t types.Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.CreatedAt); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}

	if tags == nil {
		tags = make([]types.Tag, 0)
	}
	return tags, nil
}

func (r *PostgresRepository) CreateTag(ctx context.Context, name string) (*types.Tag, error) {
	const query = `
		INSERT INTO tags (name) 
		VALUES (LOWER(TRIM($1)))
		ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
		RETURNING id, name, created_at;`

	t := &types.Tag{}
	err := r.pool.QueryRow(ctx, query, name).Scan(&t.ID, &t.Name, &t.CreatedAt)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (r *PostgresRepository) AddTagToDocument(ctx context.Context, docID uuid.UUID, tagName string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var tagID uuid.UUID
	const tagUpsertQuery = `
		INSERT INTO tags (name) 
		VALUES (LOWER(TRIM($1)))
		ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
		RETURNING id;`

	err = tx.QueryRow(ctx, tagUpsertQuery, tagName).Scan(&tagID)
	if err != nil {
		return err
	}

	const linkQuery = `
		INSERT INTO document_tags (document_id, tag_id)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING;`

	_, err = tx.Exec(ctx, linkQuery, docID, tagID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *PostgresRepository) GetTagsByDocID(ctx context.Context, docID uuid.UUID) ([]string, error) {
	const query = `
		SELECT t.name 
		FROM tags t
		JOIN document_tags dt ON dt.tag_id = t.id
		WHERE dt.document_id = $1
		ORDER BY t.name ASC;`

	rows, err := r.pool.Query(ctx, query, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := make([]string, 0)
	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}
	return tags, nil
}

func (r *PostgresRepository) GetUploadsCount(ctx context.Context, ownerID uuid.UUID) (int, error) {
	const query = `
		SELECT COUNT(*) 
		FROM documents 
		WHERE owner_id = $1;`

	var count int
	err := r.pool.QueryRow(ctx, query, ownerID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *PostgresRepository) PublishDocumentWithVector(ctx context.Context, docID, reviewerID uuid.UUID, status, content string, vectorValues []float32) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	const updateQuery = `
		UPDATE documents 
		SET status = $1, 
		    reviewer_id = CASE WHEN $1 = 'published' THEN NULL ELSE reviewer_id END,
		    updated_at = NOW() 
		WHERE id = $2 AND reviewer_id = $3`
		
	ct, err := tx.Exec(ctx, updateQuery, status, docID, reviewerID)
	if err != nil {
		return err
	}
	if ct.RowsAffected() == 0 {
		return errors.New("document not found or unauthorized reviewer")
	}

	if status == "published" && len(vectorValues) > 0 {
		const insertQuery = `INSERT INTO document_embeddings (document_id, content, embedding) VALUES ($1, $2, $3)`
		if _, err := tx.Exec(ctx, insertQuery, docID, content, pgvector.NewVector(vectorValues)); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *PostgresRepository) FindByVectorSimilarity(ctx context.Context, vectorValues []float32, limit int) ([]types.Document, []float64, error) {
	const query = `
		SELECT 
			d.id, d.project_id, d.owner_id, d.reviewer_id, d.title, 
			d.file_type, d.file_name, d.status, d.created_at, d.updated_at,
			(e.embedding <=> $1) as distance,
			coalesce(array_remove(array_agg(t.name), NULL), '{}') as tags
		FROM document_embeddings e
		JOIN documents d ON e.document_id = d.id
		LEFT JOIN document_tags dt ON d.id = dt.document_id
		LEFT JOIN tags t ON dt.tag_id = t.id
		GROUP BY d.id, e.id
		ORDER BY e.embedding <=> $1 ASC
		LIMIT $2`

	rows, err := r.pool.Query(ctx, query, pgvector.NewVector(vectorValues), limit)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var documents []types.Document
	var distances []float64

	for rows.Next() {
		var doc types.Document
		var dist float64
		var projectID, reviewerID uuid.NullUUID

		err := rows.Scan(
			&doc.ID, &projectID, &doc.OwnerID, &reviewerID, &doc.Title,
			&doc.FileType, &doc.FileName, &doc.Status, &doc.CreatedAt, &doc.UpdatedAt,
			&dist, &doc.Tags,
		)
		if err != nil {
			return nil, nil, err
		}

		if projectID.Valid { doc.ProjectID = &projectID.UUID }
		if reviewerID.Valid { doc.ReviewerID = &reviewerID.UUID }

		documents = append(documents, doc)
		distances = append(distances, dist)
	}

	return documents, distances, nil
}

func (r *PostgresRepository) GetPublishedCountsByProject(ctx context.Context) (map[string]int, error) {
	query := `
		SELECT COALESCE(p.name, 'All projects') as project_name, COUNT(d.id)::int as count
		FROM documents d
		LEFT JOIN projects p ON p.id = d.project_id
		WHERE d.status = 'published'
		GROUP BY p.name;`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := make(map[string]int)
	for rows.Next() {
		var name string
		var count int
		if err := rows.Scan(&name, &count); err != nil {
			return nil, err
		}
		counts[name] = count
	}
	return counts, nil
}

func (r *PostgresRepository) GetPublishedByProject(ctx context.Context, projectName string) ([]types.Document, error) {
	var query string
	var args []interface{}

	if projectName == "All projects" {
		query = `
			SELECT d.id, d.project_id, COALESCE(p.name, '') as project_name,
			       d.owner_id, d.reviewer_id, d.title, d.file_type, d.file_name,
			       d.status, d.created_at, d.updated_at
			FROM documents d
			LEFT JOIN projects p ON p.id = d.project_id
			WHERE d.status = 'published'
			ORDER BY d.created_at DESC;`
	} else {
		query = `
			SELECT d.id, d.project_id, COALESCE(p.name, '') as project_name,
			       d.owner_id, d.reviewer_id, d.title, d.file_type, d.file_name,
			       d.status, d.created_at, d.updated_at
			FROM documents d
			JOIN projects p ON p.id = d.project_id
			WHERE d.status = 'published' AND p.name = $1
			ORDER BY d.created_at DESC;`
		args = append(args, projectName)
	}

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []types.Document
	for rows.Next() {
		var doc types.Document
		err := rows.Scan(
			&doc.ID, &doc.ProjectID, &doc.ProjectName, &doc.OwnerID, &doc.ReviewerID,
			&doc.Title, &doc.FileType, &doc.FileName, &doc.FilePath, &doc.Status, 
			&doc.CreatedAt, &doc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}
	return docs, nil
}