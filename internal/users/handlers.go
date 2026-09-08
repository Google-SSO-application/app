package users

import (
	"encoding/json"
	"net/http"

	"github.com/codimite-learning/knowledge-hub/internal/authz"
	"github.com/google/uuid"
)

type HttpHandler struct {
	service *Service
}

func NewHttpHandler(service *Service) *HttpHandler {
	return &HttpHandler{service: service}
}

func (h *HttpHandler) ListTeammatesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated || ac.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	teammates, err := h.service.ListTeammates(r.Context(), ac.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(teammates)
}
