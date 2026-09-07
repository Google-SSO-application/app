package types

import (
	"context"
	"time"

	"github.com/golang-jwt/jwt/v5"
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

type GoogleUserInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	HD            string `json:"hd"`
}

type RefreshClaims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

type Session struct {
	UserID uuid.UUID
	Email  string
	Role   string
}

type TokenStore interface {
	SaveSession(ctx context.Context, token string, session Session, ttl time.Duration) error
	GetSession(ctx context.Context, token string) (Session, error)
	DeleteSession(ctx context.Context, token string) error
}
