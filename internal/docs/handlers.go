package docs

import (
	"encoding/json"
	"net/http"
	"strings"
	"errors"

	"github.com/google/uuid"

	"github.com/codimite-learning/knowledge-hub/internal/authz"
)

type HttpHandler struct {
	s *Service
}

type assignReviewerRequest struct {
	DocumentID string `json:"document_id"`
	ReviewerID string `json:"reviewer_id"`
}

func NewHttpHandler(s *Service) *HttpHandler {
	return &HttpHandler{s: s}
}

func (h *HttpHandler) UploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	authCtx := authz.FromContext(r.Context())

	// Double check fallback security safety net
	if !authCtx.Authenticated || authCtx.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ownerID := authCtx.UserID

	r.Body = http.MaxBytesReader(w, r.Body, 50*1024*1024)
	if err := r.ParseMultipartForm(50 * 1024 * 1024); err != nil {
		http.Error(w, "File dimensions exceed 50MB limit", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Missing file payload field", http.StatusBadRequest)
		return
	}
	defer file.Close()

	projectName := strings.TrimSpace(r.FormValue("project"))
	if projectName == "" {
		http.Error(w, "Missing project", http.StatusBadRequest)
		return
	}

	projectIDStr := r.FormValue("project_id")
	var projectID *uuid.UUID
	if projectIDStr != "" {
		projectUUID, err := uuid.Parse(projectIDStr)
		if err != nil {
			http.Error(w, "Invalid project", http.StatusBadRequest)
			return
		}
		projectID = &projectUUID
	}

	reviewerIDStr := r.FormValue("reviewer_id")
	var reviewerID *uuid.UUID
	if reviewerIDStr != "" {
		reviewerUUID := uuid.MustParse(reviewerIDStr)
		reviewerID = &reviewerUUID
	}

	title := r.FormValue("title")
	if title == "" {
		title = header.Filename
	}

	doc, err := h.s.Upload(r.Context(), ownerID, title, projectID, projectName, reviewerID, header.Filename, file)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(doc)
}

func (h *HttpHandler) ListUserDocsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	authCtx := authz.FromContext(r.Context())
	if !authCtx.Authenticated || authCtx.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	ownerID := authCtx.UserID

	docs, err := h.s.GetUserDashboard(r.Context(), ownerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(docs)
}

func (h *HttpHandler) AssignReviewerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated || ac.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req assignReviewerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload body", http.StatusBadRequest)
		return
	}

	docUUID, err := uuid.Parse(req.DocumentID)
	if err != nil {
		http.Error(w, "Invalid document identity uuid string format", http.StatusBadRequest)
		return
	}

	reviewerUUID, err := uuid.Parse(req.ReviewerID)
	if err != nil {
		http.Error(w, "Invalid reviewer identity uuid string format", http.StatusBadRequest)
		return
	}

	if err := h.s.AssignReviewer(r.Context(), docUUID, reviewerUUID); err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, ErrDocumentNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, ErrSelfReviewNotAllowed) {
			status = http.StatusBadRequest
		}
		http.Error(w, err.Error(), status)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"message":"Reviewer assigned successfully"}`))
}