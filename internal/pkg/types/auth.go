package types

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type AuthContext struct {
	Authenticated bool
	UserID        uuid.UUID
	Email         string
	Role          string
}

type HandlerConfig struct {
	FrontendURL  string
	CookieDomain string
	CookieSecure bool
}

type Session struct {
	UserID uuid.UUID
	Email  string
	Role   string
}

// JWT payload for refresh tokens.
// RefreshTokenIssuer mints and validates JWT refresh tokens.
type RefreshTokenIssuer struct {
	secret []byte
	ttl    time.Duration
}

type TokenStore interface {
	SaveSession(ctx context.Context, token string, session Session, ttl time.Duration) error
	GetSession(ctx context.Context, token string) (Session, error)
	DeleteSession(ctx context.Context, token string) error
}
