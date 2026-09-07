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
}

type PostgresRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

func (r *PostgresRepository) CreateDocument(ctx context.Context, doc *types.Document, filePath string) error {
	query := `
		INSERT INTO documents (project_id, project_category, owner_id, reviewer_id, title, file_type, file_path, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at;`

	return r.pool.QueryRow(ctx, query,
		doc.ProjectID, doc.ProjectCategory, doc.OwnerID, doc.ReviewerID, doc.Title, doc.FileType, filePath, doc.Status,
	).Scan(&doc.ID, &doc.CreatedAt, &doc.UpdatedAt)
}

func (r *PostgresRepository) GetDocsByOwner(ctx context.Context, ownerID uuid.UUID) ([]types.Document, error) {
	query := `
		SELECT d.id, d.project_id, COALESCE(d.project_category, p.category, p.name, ''),
		       COALESCE(d.project_category, p.category, p.name, ''), d.owner_id, d.reviewer_id, d.title, d.file_type,
		       split_part(d.file_path, '/', cardinality(string_to_array(d.file_path, '/'))) as file_name,
		       d.status, d.created_at, d.updated_at
		FROM documents d
		LEFT JOIN projects p ON p.id = d.project_id
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
		err := rows.Scan(&d.ID, &d.ProjectID, &d.ProjectName, &d.ProjectCategory, &d.OwnerID, &d.ReviewerID, &d.Title, &d.FileType, &d.FileName, &d.Status, &d.CreatedAt, &d.UpdatedAt)
		if err != nil {
			return nil, err
		}
		docs = append(docs, d)
	}
	return docs, nil
}
