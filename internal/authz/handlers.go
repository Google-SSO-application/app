package authz

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/google/uuid"
)

// Cookie names shared by every handler below.
const (
	AccessTokenCookieName  = "khub_at"
	RefreshTokenCookieName = "khub_rt"
	oauthStateCookieName   = "khub_oauth_state"
)

type UserService interface {
	GetOrCreateFromGoogle(context.Context, types.GoogleProfile) (*types.User, error)
	GetByID(context.Context, uuid.UUID) (*types.User, error)
}

type Handler struct {
	google  *GoogleOAuth
	users   UserService
	access  *AccessTokenIssuer
	refresh *RefreshTokenIssuer
	cfg     types.HandlerConfig
	log     *slog.Logger
}

func NewHandler(google *GoogleOAuth, userSvc UserService, access *AccessTokenIssuer, refresh *RefreshTokenIssuer, cfg types.HandlerConfig, log *slog.Logger) *Handler {
	return &Handler{google: google, users: userSvc, access: access, refresh: refresh, cfg: cfg, log: log}
}

// HandleGoogleLogin starts the OAuth flow: GET /web/auth/google/login
func (h *Handler) HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	state, err := GenerateState()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "failed to start login")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     oauthStateCookieName,
		Value:    state,
		Path:     "/web/auth/google",
		MaxAge:   600, // 10 minutes to complete the round trip to Google and back
		HttpOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})

	http.Redirect(w, r, h.google.AuthCodeURL(state), http.StatusFound)
}

// HandleGoogleCallback completes the OAuth flow: GET /web/auth/google/callback
func (h *Handler) HandleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	stateCookie, err := r.Cookie(oauthStateCookieName)
	if err != nil || stateCookie.Value == "" || stateCookie.Value != r.URL.Query().Get("state") {
		writeJSONError(w, http.StatusBadRequest, "invalid oauth state")
		return
	}
	clearCookie(w, oauthStateCookieName, "/web/auth/google", h.cfg.CookieSecure)

	code := r.URL.Query().Get("code")
	if code == "" {
		writeJSONError(w, http.StatusBadRequest, "missing authorization code")
		return
	}

	tok, err := h.google.Exchange(ctx, code)
	if err != nil {
		h.log.Error("google token exchange failed", "err", err)
		writeJSONError(w, http.StatusUnauthorized, "google sign-in failed")
		return
	}

	info, err := h.google.FetchUserInfo(ctx, tok)
	if err != nil {
		if errors.Is(err, ErrDomainNotAllowed) {
			writeJSONError(w, http.StatusForbidden, "only codimiteinterns.com accounts may sign in")
			return
		}
		h.log.Error("failed to fetch google userinfo", "err", err)
		writeJSONError(w, http.StatusUnauthorized, "google sign-in failed")
		return
	}

	u, err := h.users.GetOrCreateFromGoogle(ctx, types.GoogleProfile{
		Email:   info.Email,
		Name:    info.Name,
		Picture: info.Picture,
	})
	if err != nil {
		h.log.Error("failed to upsert user", "err", err)
		writeJSONError(w, http.StatusInternalServerError, "sign-in failed")
		return
	}

	if err := h.issueSession(w, ctx, u.ID, u.Email, string(u.Role)); err != nil {
		h.log.Error("failed to issue session", "err", err)
		writeJSONError(w, http.StatusInternalServerError, "sign-in failed")
		return
	}

	http.Redirect(w, r, h.cfg.FrontendURL, http.StatusFound)
}

// HandleRefresh rotates the session: POST /web/auth/refresh
func (h *Handler) HandleRefresh(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	cookie, err := r.Cookie(RefreshTokenCookieName)
	if err != nil || cookie.Value == "" {
		writeJSONError(w, http.StatusUnauthorized, "missing refresh token")
		return
	}

	userID, _, err := h.refresh.Validate(cookie.Value)
	if err != nil {
		writeJSONError(w, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	u, err := h.users.GetByID(ctx, userID)
	if err != nil {
		writeJSONError(w, http.StatusUnauthorized, "user no longer exists")
		return
	}

	if err := h.issueSession(w, ctx, u.ID, u.Email, string(u.Role)); err != nil {
		h.log.Error("failed to rotate session", "err", err)
		writeJSONError(w, http.StatusInternalServerError, "failed to refresh session")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// HandleLogout revokes the opaque token in Redis and clears both cookies.
func (h *Handler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(AccessTokenCookieName); err == nil && cookie.Value != "" {
		_ = h.access.Revoke(r.Context(), cookie.Value)
	}
	clearCookie(w, AccessTokenCookieName, "/", h.cfg.CookieSecure)
	clearCookie(w, RefreshTokenCookieName, "/web/auth", h.cfg.CookieSecure)
	w.WriteHeader(http.StatusNoContent)
}

// HandleMe returns the current user's profile.
func (h *Handler) HandleMe(w http.ResponseWriter, r *http.Request) {
	ac := FromContext(r.Context())
	u, err := h.users.GetByID(r.Context(), ac.UserID)
	if err != nil {
		writeJSONError(w, http.StatusNotFound, "user not found")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"id":      u.ID,
		"email":   u.Email,
		"name":    u.Name,
		"picture": u.Picture,
		"role":    u.Role,
	})
}

// issueSession mints a fresh opaque access token + JWT refresh token pair
// and sets them as HttpOnly cookies.
func (h *Handler) issueSession(w http.ResponseWriter, ctx context.Context, userID uuid.UUID, email, role string) error {
	accessToken, err := h.access.Issue(ctx, types.Session{UserID: userID, Email: email, Role: role})
	if err != nil {
		return err
	}
	refreshToken, err := h.refresh.Issue(userID, email)
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     AccessTokenCookieName,
		Value:    accessToken,
		Path:     "/",
		MaxAge:   int(h.access.TTL().Seconds()),
		HttpOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     RefreshTokenCookieName,
		Value:    refreshToken,
		Path:     "/web/auth",
		MaxAge:   int(h.refresh.TTL().Seconds()),
		HttpOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
	return nil
}

func clearCookie(w http.ResponseWriter, name, path string, secure bool) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     path,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
	})
}
