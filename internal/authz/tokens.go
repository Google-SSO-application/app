package authz

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/google/uuid"
)

var ErrSessionNotFound = errors.New("session not found or expired")

// Session is what an opaque access token resolves to via Redis.
type Session struct {
	UserID uuid.UUID
	Email  string
	Role   string
}

// TokenStore persists the mapping from opaque access token -> Session.
// The only real implementation is Redis (session_store.go); the interface
// exists so handlers/middleware depend on behavior, not on go-redis.
type TokenStore interface {
	SaveSession(ctx context.Context, token string, s Session, ttl time.Duration) error
	GetSession(ctx context.Context, token string) (Session, error)
	DeleteSession(ctx context.Context, token string) error
}

// AccessTokenIssuer mints and validates opaque access tokens. "Opaque"
// means the token itself carries no information — it's just a random key
// into Redis, which is what the acceptance criteria require.
type AccessTokenIssuer struct {
	store TokenStore
	ttl   time.Duration
}

func NewAccessTokenIssuer(store TokenStore, ttl time.Duration) *AccessTokenIssuer {
	return &AccessTokenIssuer{store: store, ttl: ttl}
}

func (a *AccessTokenIssuer) TTL() time.Duration { return a.ttl }

// Issue creates a new opaque token for the given session and stores it in
// Redis with the configured TTL.
func (a *AccessTokenIssuer) Issue(ctx context.Context, s Session) (string, error) {
	token, err := generateOpaqueToken(32)
	if err != nil {
		return "", err
	}
	if err := a.store.SaveSession(ctx, token, s, a.ttl); err != nil {
		return "", err
	}
	return token, nil
}

// Validate resolves an opaque token back to its Session, or
// ErrSessionNotFound if it is missing/expired/revoked.
func (a *AccessTokenIssuer) Validate(ctx context.Context, token string) (Session, error) {
	return a.store.GetSession(ctx, token)
}

// Revoke deletes the token from Redis (used on logout).
func (a *AccessTokenIssuer) Revoke(ctx context.Context, token string) error {
	return a.store.DeleteSession(ctx, token)
}

func generateOpaqueToken(numBytes int) (string, error) {
	b := make([]byte, numBytes)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
