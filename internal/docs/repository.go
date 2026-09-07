package docs

import (
	"context"
	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/google/uuid"
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
		INSERT INTO documents (project_id, owner_id, reviewer_id, title, file_type, file_path, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, updated_at;`

	return r.pool.QueryRow(ctx, query, 
		doc.ProjectID, doc.OwnerID, doc.ReviewerID, doc.Title, doc.FileType, filePath, doc.Status,
	).Scan(&doc.ID, &doc.CreatedAt, &doc.UpdatedAt)
}

func (r *PostgresRepository) GetDocsByOwner(ctx context.Context, ownerID uuid.UUID) ([]types.Document, error) {
	query := `
		SELECT id, project_id, owner_id, reviewer_id, title, file_type, split_part(file_path, '/', cardinality(string_to_array(file_path, '/'))) as file_name, status, created_at, updated_at 
		FROM documents 
		WHERE owner_id = $1 
		ORDER BY created_at DESC;`
	
	rows, err := r.pool.Query(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	docs := make([]types.Document, 0)
	for rows.Next() {
		var d types.Document
		err := rows.Scan(&d.ID, &d.ProjectID, &d.OwnerID, &d.ReviewerID, &d.Title, &d.FileType, &d.FileName, &d.Status, &d.CreatedAt, &d.UpdatedAt)
		if err != nil {
			return nil, err
		}
		docs = append(docs, d)
	}
	return docs, nil
}
