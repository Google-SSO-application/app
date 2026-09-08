package users

import (
	"context"
	"errors"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("user not found")

// Repository abstracts persistence so Service (and anything that tests it)
// depends on an interface, not a concrete Postgres client.
type postgresRepository struct {
	pool *pgxpool.Pool
}

// NewPostgresRepository is the DI constructor used by cmd/khub/main.go.
func NewPostgresRepository(pool *pgxpool.Pool) types.UserRepository {
	return &postgresRepository{pool: pool}
}

func (r *postgresRepository) GetByEmail(ctx context.Context, email string) (*types.User, error) {
	const q = `
		SELECT id, email, name, picture, role, created_at, updated_at, COALESCE(last_login_at, created_at)
		FROM users WHERE email = $1`
	return r.scanOne(ctx, q, email)
}

func (r *postgresRepository) GetByID(ctx context.Context, id uuid.UUID) (*types.User, error) {
	const q = `
		SELECT id, email, name, picture, role, created_at, updated_at, COALESCE(last_login_at, created_at)
		FROM users WHERE id = $1`
	return r.scanOne(ctx, q, id)
}

func (r *postgresRepository) scanOne(ctx context.Context, q string, arg any) (*types.User, error) {
	row := r.pool.QueryRow(ctx, q, arg)
	var u types.User
	var role string
	if err := row.Scan(&u.ID, &u.Email, &u.Name, &u.Picture, &role, &u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	u.Role = types.Role(role)
	return &u, nil
}

func (r *postgresRepository) Upsert(ctx context.Context, u *types.User) error {
	const q = `
		INSERT INTO users (id, email, name, picture, role, last_login_at)
		VALUES ($1, $2, $3, $4, $5, now())
		ON CONFLICT (email) DO UPDATE
			SET name = EXCLUDED.name,
			    picture = EXCLUDED.picture,
			    last_login_at = now(),
			    updated_at = now()
		RETURNING id, role, created_at, updated_at, last_login_at`

	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	if u.Role == "" {
		u.Role = types.RoleUser
	}

	row := r.pool.QueryRow(ctx, q, u.ID, u.Email, u.Name, u.Picture, string(u.Role))
	var role string
	if err := row.Scan(&u.ID, &role, &u.CreatedAt, &u.UpdatedAt, &u.LastLoginAt); err != nil {
		return err
	}
	u.Role = types.Role(role)
	return nil
}

func (r *postgresRepository) ListByRole(ctx context.Context, role types.Role) ([]*types.User, error) {
	const q = `
		SELECT id, email, name, picture, role, created_at, updated_at, COALESCE(last_login_at, created_at)
		FROM users 
		WHERE role = $1
		ORDER BY name ASC`

	rows, err := r.pool.Query(ctx, q, string(role))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*types.User
	for rows.Next() {
		var u types.User
		var rString string
		err := rows.Scan(
			&u.ID, 
			&u.Email, 
			&u.Name, 
			&u.Picture, 
			&rString, 
			&u.CreatedAt, 
			&u.UpdatedAt, 
			&u.LastLoginAt,
		)
		if err != nil {
			return nil, err
		}
		u.Role = types.Role(rString)
		users = append(users, &u)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if users == nil {
		users = make([]*types.User, 0)
	}

	return users, nil
}
