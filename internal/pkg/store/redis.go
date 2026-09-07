package store

import (
	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/redis/go-redis/v9"
)

// NewRedisClient builds a ready-to-use Redis client.
func NewRedisClient(cfg types.RedisConfig) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})
}
