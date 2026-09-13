package authz

import (
	"context"
	"encoding/json"
	"net/http"
	"github.com/google/uuid"
)

type ctxKey string

type AuthContext struct {
	Authenticated bool
	UserID        uuid.UUID
	Email         string
	Role          string
}

const authContextKey ctxKey = "khub_auth_context"

func withAuthContext(ctx context.Context, ac AuthContext) context.Context {
	return context.WithValue(ctx, authContextKey, ac)
}

func FromContext(ctx context.Context) AuthContext {
	if ac, ok := ctx.Value(authContextKey).(AuthContext); ok {
		return ac
	}
	return AuthContext{}
}


func Middleware(issuer *AccessTokenIssuer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ac := AuthContext{}

			if cookie, err := r.Cookie(AccessTokenCookieName); err == nil && cookie.Value != "" {
				if sess, verr := issuer.Validate(r.Context(), cookie.Value); verr == nil {
					ac = AuthContext{
						Authenticated: true,
						UserID:        sess.UserID,
						Email:         sess.Email,
						Role:          sess.Role,
					}
				}
			}

			next.ServeHTTP(w, r.WithContext(withAuthContext(r.Context(), ac)))
		})
	}
}

func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !FromContext(r.Context()).Authenticated {
			writeJSONError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSONError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
