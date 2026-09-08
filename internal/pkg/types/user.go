package types

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

type User struct {
	ID          uuid.UUID
	Email       string
	Name        string
	Picture     string
	Role        Role
	CreatedAt   time.Time
	UpdatedAt   time.Time
	LastLoginAt time.Time
}

type GoogleProfile struct {
	Email   string
	Name    string
	Picture string
}

type UserRepository interface {
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	Upsert(ctx context.Context, user *User) error
	ListByRole(ctx context.Context, role Role) ([]*User, error)
}
