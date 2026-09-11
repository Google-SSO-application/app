package store

import (
	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/redis/go-redis/v9"
)

func NewRedisClient(cfg types.RedisConfig) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})
}
