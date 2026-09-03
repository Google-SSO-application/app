package authz

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// redisTokenStore is the Redis-backed TokenStore implementation.
type redisTokenStore struct {
	client *redis.Client
}

func NewRedisTokenStore(client *redis.Client) TokenStore {
	return &redisTokenStore{client: client}
}

type sessionRecord struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

func sessionKey(token string) string {
	return "khub:session:" + token
}

func (s *redisTokenStore) SaveSession(ctx context.Context, token string, sess Session, ttl time.Duration) error {
	rec := sessionRecord{
		UserID: sess.UserID.String(),
		Email:  sess.Email,
		Role:   sess.Role,
	}
	data, err := json.Marshal(rec)
	if err != nil {
		return err
	}
	return s.client.Set(ctx, sessionKey(token), data, ttl).Err()
}

func (s *redisTokenStore) GetSession(ctx context.Context, token string) (Session, error) {
	data, err := s.client.Get(ctx, sessionKey(token)).Bytes()
	if errors.Is(err, redis.Nil) {
		return Session{}, ErrSessionNotFound
	}
	if err != nil {
		return Session{}, err
	}

	var rec sessionRecord
	if err := json.Unmarshal(data, &rec); err != nil {
		return Session{}, err
	}
	userID, err := uuid.Parse(rec.UserID)
	if err != nil {
		return Session{}, err
	}
	return Session{UserID: userID, Email: rec.Email, Role: rec.Role}, nil
}

func (s *redisTokenStore) DeleteSession(ctx context.Context, token string) error {
	return s.client.Del(ctx, sessionKey(token)).Err()
}
