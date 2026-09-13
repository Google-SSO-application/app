package authz

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"
)

var ErrSessionNotFound = errors.New("session not found or expired")

type TokenStore interface {
	SaveSession(ctx context.Context, token string, session Session, ttl time.Duration) error
	GetSession(ctx context.Context, token string) (Session, error)
	DeleteSession(ctx context.Context, token string) error
}

type AccessTokenIssuer struct {
	store TokenStore
	ttl   time.Duration
}

func NewAccessTokenIssuer(store TokenStore, ttl time.Duration) *AccessTokenIssuer {
	return &AccessTokenIssuer{store: store, ttl: ttl}
}

func (a *AccessTokenIssuer) TTL() time.Duration { return a.ttl }

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

func (a *AccessTokenIssuer) Validate(ctx context.Context, token string) (Session, error) {
	return a.store.GetSession(ctx, token)
}

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
