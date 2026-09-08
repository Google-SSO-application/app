package docs

import (
	"context"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	CreateDocument(ctx context.Context, doc *types.Document, filePath string) error
	GetDocsByOwner(ctx context.Context, ownerID uuid.UUID) ([]types.Document, error)
	AssignReviewer(ctx context.Context, docID uuid.UUID, reviewerID uuid.UUID) error
	RemoveReviewer(ctx context.Context, docID uuid.UUID) error
	GetByID(ctx context.Context, docID uuid.UUID) (*types.Document, error)
	ListReviewDocs(ctx context.Context, reviewerID uuid.UUID) ([]types.Document, error)
	UpdateReviewStatus(ctx context.Context, docID, reviewerID uuid.UUID, status string) error
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
		       d.status, d.created_at, d.updated_at
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
		err := rows.Scan(&d.ID, &d.ProjectID, &d.ProjectName, &d.OwnerID, &d.ReviewerID, &d.ReviewerName, &d.ReviewerEmail, &d.ReviewerPicture, &d.Title, &d.FileType, &d.FileName, &d.Status, &d.CreatedAt, &d.UpdatedAt)
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
		SELECT d.id, d.project_id, COALESCE(p.name, '') as project_name,
		       d.owner_id, d.reviewer_id, d.title, d.file_type, d.file_name,
		       d.status, d.created_at, d.updated_at
		FROM documents d
		LEFT JOIN projects p ON p.id = d.project_id
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
			&d.Title, &d.FileType, &d.FileName, &d.Status, &d.CreatedAt, &d.UpdatedAt,
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
