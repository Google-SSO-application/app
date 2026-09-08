package projects

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/codimite-learning/knowledge-hub/internal/authz"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

type HttpHandler struct {
	service *Service
}

func NewHttpHandler(service *Service) *HttpHandler {
	return &HttpHandler{service: service}
}

type createRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (h *HttpHandler) CreateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated || ac.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var request createRequest
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	if err := decoder.Decode(&request); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	project, err := h.service.Create(r.Context(), ac.UserID, request.Name, request.Description)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, ErrNameRequired) {
			status = http.StatusBadRequest
		}
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			status = http.StatusConflict
		}
		http.Error(w, err.Error(), status)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(project)
}

func (h *HttpHandler) ListHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated || ac.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	projects, err := h.service.List(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(projects)
}
