package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"fmt"
	"log"
	
	"github.com/codimite-learning/knowledge-hub/internal/pkg/store"
	"github.com/codimite-learning/knowledge-hub/internal/pkg/types" 
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	if err := run(logger); err != nil {
		logger.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := types.LoadConfig()
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	
	pgPool, err := store.NewPostgresPool(ctx, cfg.PostgresDSN)
	if err != nil {
		return err
	}
	defer pgPool.Close()

	if err := store.RunMigrations(ctx, pgPool); err != nil {
		return err
	}

	redisClient := store.NewRedisClient(store.RedisConfig{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})
	defer redisClient.Close()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		return err
	}

	// ---- domain (users) ----
	userRepo := users.NewPostgresRepository(pgPool)
	userService := users.NewService(userRepo)

}