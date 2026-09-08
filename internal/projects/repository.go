package projects

import (
	"context"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, project *types.Project) error
	List(ctx context.Context) ([]*types.Project, error)
}

type PostgresRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

func (r *PostgresRepository) Create(ctx context.Context, project *types.Project) error {
	const query = `
		INSERT INTO projects (name, description, created_by)
		VALUES ($1, $2, $3)
		RETURNING id, created_at`

	return r.pool.QueryRow(ctx, query, project.Name, project.Description, project.CreatedBy).Scan(&project.ID, &project.CreatedAt)
}

func (r *PostgresRepository) List(ctx context.Context) ([]*types.Project, error) {
	const query = `
		SELECT id, name, description, created_by, created_at
		FROM projects 
		ORDER BY name ASC`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []*types.Project
	for rows.Next() {
		p := &types.Project{}
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt); err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if projects == nil {
		projects = make([]*types.Project, 0)
	}

	return projects, nil
}
