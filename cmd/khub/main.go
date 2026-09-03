package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/codimite-learning/knowledge-hub/internal/authz"
	"github.com/codimite-learning/knowledge-hub/internal/pkg/store"
	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/codimite-learning/knowledge-hub/internal/users"
	"github.com/codimite-learning/knowledge-hub/web"
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

	// domain (users)
	userRepo := users.NewPostgresRepository(pgPool)
	userService := users.NewService(userRepo)

	// domain (authz)
	googleOAuth := authz.NewGoogleOAuth(cfg.GoogleClientID, cfg.GoogleClientSecret, cfg.GoogleRedirectURL, cfg.AllowedGoogleDomain)
	tokenStore := authz.NewRedisTokenStore(redisClient)
	accessIssuer := authz.NewAccessTokenIssuer(tokenStore, cfg.AccessTokenTTL)
	refreshIssuer := authz.NewRefreshTokenIssuer(cfg.JWTRefreshSecret, cfg.RefreshTokenTTL)

	authHandler := authz.NewHandler(googleOAuth, userService, accessIssuer, refreshIssuer, authz.HandlerConfig{
		FrontendURL:  cfg.FrontendURL,
		CookieDomain: cfg.CookieDomain,
		CookieSecure: cfg.CookieSecure,
	}, logger)

	// frontend (embedded SPA)
	spaHandler, err := web.SPAHandler()
	if err != nil {
		return err
	}

	r := web.NewRouter(authHandler, accessIssuer, spaHandler)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		logger.Info("khub listening", "port", cfg.Port, "env", cfg.Env)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server error", "err", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	return srv.Shutdown(shutdownCtx)

}
