package authz

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
)

type ctxKey string

const authContextKey ctxKey = "khub_auth_context"

func withAuthContext(ctx context.Context, ac types.AuthContext) context.Context {
	return context.WithValue(ctx, authContextKey, ac)
}

func FromContext(ctx context.Context) types.AuthContext {
	if ac, ok := ctx.Value(authContextKey).(types.AuthContext); ok {
		return ac
	}
	return types.AuthContext{}
}


func Middleware(issuer *AccessTokenIssuer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ac := types.AuthContext{}

			if cookie, err := r.Cookie(AccessTokenCookieName); err == nil && cookie.Value != "" {
				if sess, verr := issuer.Validate(r.Context(), cookie.Value); verr == nil {
					ac = types.AuthContext{
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
