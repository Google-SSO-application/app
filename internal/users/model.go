package users

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

// User is the persisted domain model, backed by the `users` table.
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
