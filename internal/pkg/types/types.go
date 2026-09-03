package types

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string
	Env  string

	PostgresDSN string

	FrontendURL  string
	CookieDomain string
	CookieSecure bool

	RedisAddr     string
	RedisPassword string
	RedisDB       int

	GoogleClientID      string
	GoogleClientSecret  string
	GoogleRedirectURL   string
	AllowedGoogleDomain string

	JWTRefreshSecret string
	AccessTokenTTL   time.Duration
	RefreshTokenTTL  time.Duration
}

func LoadConfig() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		Port: getEnv("APP_PORT", "8080"),
		Env:  getEnv("APP_ENV", "development"),

		FrontendURL:  getEnv("FRONTEND_URL", "http://localhost:8080"),
		CookieDomain: getEnv("COOKIE_DOMAIN", "localhost"),
		CookieSecure: getEnvBool("COOKIE_SECURE", false),

		PostgresDSN: os.Getenv("POSTGRES_DSN"),

		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: os.Getenv("REDIS_PASSWORD"),
		RedisDB:       getEnvInt("REDIS_DB", 0),

		GoogleClientID:      os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:  os.Getenv("GOOGLE_CLIENT_SECRET"),
		GoogleRedirectURL:   os.Getenv("GOOGLE_REDIRECT_URL"),
		AllowedGoogleDomain: getEnv("ALLOWED_GOOGLE_DOMAIN", "codimiteinterns.com"),

		JWTRefreshSecret: os.Getenv("JWT_REFRESH_SECRET"),
		AccessTokenTTL:   getEnvDuration("ACCESS_TOKEN_TTL", 15*time.Minute),
		RefreshTokenTTL:  getEnvDuration("REFRESH_TOKEN_TTL", 7*24*time.Hour),
	}

	if cfg.PostgresDSN == "" {
		return nil, fmt.Errorf("POSTGRES_DSN is required")
	}
	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" || cfg.GoogleRedirectURL == "" {
		return nil, fmt.Errorf("GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URL are required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return fallback
}