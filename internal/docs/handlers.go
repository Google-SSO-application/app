package docs

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"github.com/codimite-learning/knowledge-hub/internal/authz"
	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
)

type HttpHandler struct {
	s *Service
}

type assignReviewerRequest struct {
	DocumentID string `json:"document_id"`
	ReviewerID string `json:"reviewer_id"`
}

type SearchResponse struct {
	Document types.Document `json:"document"`
	Distance float64        `json:"distance"`
}

type countResponse struct {
	Count int `json:"count"`
}

type createTagGlobalRequest struct {
	Name string `json:"name"`
}

type createTagRequest struct {
	DocumentID string   `json:"document_id"`
	Tags       []string `json:"tags"`
}

type ProjectCount struct {
	ProjectName string `json:"project_name"`
	Count       int    `json:"count"`
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

func (h *HttpHandler) RemoveReviewerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated || ac.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		DocumentID string `json:"document_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload body", http.StatusBadRequest)
		return
	}

	docUUID, err := uuid.Parse(req.DocumentID)
	if err != nil {
		http.Error(w, "Invalid document identity uuid string format", http.StatusBadRequest)
		return
	}

	if err := h.s.RemoveReviewer(r.Context(), docUUID); err != nil {
		if errors.Is(err, ErrDocumentNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"message":"Reviewer removed successfully"}`))
}

func (h *HttpHandler) ListReviewDocsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated || ac.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	reviewDocs, err := h.s.ListReviewDocs(r.Context(), ac.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(reviewDocs)
}

func (h *HttpHandler) ListTagsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	tags, err := h.s.ListAllTags(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(tags)
}

func (h *HttpHandler) HandleReview(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		DocumentID uuid.UUID `json:"document_id"`
		Status     string    `json:"status"` 
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body payload", http.StatusBadRequest)
		return
	}

	if req.DocumentID == uuid.Nil || req.Status == "" {
		http.Error(w, "missing required fields: document_id and status are mandatory", http.StatusBadRequest)
		return
	}

	ac := authz.FromContext(r.Context())
	
	err := h.s.ProcessReviewWorkflow(r.Context(), req.DocumentID, ac.UserID, req.Status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "document review workflow updated successfully",
		"status":  req.Status,
	})
}

func (h *HttpHandler) HandleSearch(w http.ResponseWriter, r *http.Request) {
	term := r.URL.Query().Get("q")
	if term == "" {
		http.Error(w, "query validation failed", http.StatusBadRequest)
		return
	}
	projectName := r.URL.Query().Get("project")

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 {
		limit = 20
	}

	docsList, distances, err := h.s.QueryArticlesBySemanticContext(r.Context(), term, projectName, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	results := make([]SearchResponse, len(docsList))
	for i := range docsList {
		results[i] = SearchResponse{Document: docsList[i], Distance: distances[i]}
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(results)
}

func (h *HttpHandler) CreateGlobalTagHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req createTagGlobalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	tag, err := h.s.CreateTag(r.Context(), req.Name)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(tag)
}

func (h *HttpHandler) CreateDocTagsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req createTagRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	docUUID, err := uuid.Parse(req.DocumentID)
	if err != nil {
		http.Error(w, "Invalid document UUID format", http.StatusBadRequest)
		return
	}

	if err := h.s.AddTagsToDoc(r.Context(), docUUID, req.Tags); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_, _ = w.Write([]byte(`{"message":"Tags applied successfully"}`))
}

func (h *HttpHandler) GetCountHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ac := authz.FromContext(r.Context())
	if !ac.Authenticated || ac.UserID == uuid.Nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	count, err := h.s.GetUserUploadsCount(r.Context(), ac.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(countResponse{Count: count})
}

func (h *HttpHandler) GetPublishedCountsHandler(w http.ResponseWriter, r *http.Request) {
	countsMap, err := h.s.GetProjectPublishedCounts(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Unpack map layout records smoothly into our DTO slice array structure
	results := make([]ProjectCount, 0, len(countsMap))
	for name, count := range countsMap {
		results = append(results, ProjectCount{
			ProjectName: name,
			Count:       count,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func (h *HttpHandler) ListPublishedDocsHandler(w http.ResponseWriter, r *http.Request) {
	projectName := r.URL.Query().Get("project")
	if projectName == "" {
		projectName = "All projects"
	}

	docsList, err := h.s.GetPublishedDocuments(r.Context(), projectName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(docsList)
}