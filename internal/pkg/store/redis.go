package store

import "github.com/redis/go-redis/v9"

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

// NewRedisClient builds a ready-to-use Redis client.
func NewRedisClient(cfg RedisConfig) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})
}
