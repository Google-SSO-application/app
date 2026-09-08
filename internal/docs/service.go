package docs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/google/uuid"
)

var (
	ErrDocumentNotFound   = errors.New("document not found")
	ErrSelfReviewNotAllowed = errors.New("you cannot assign yourself as a reviewer for your own document")
)

type Service struct {
	repo    Repository
	storage FileStorage
}

func NewService(repo Repository, storage FileStorage) *Service {
	return &Service{repo: repo, storage: storage}
}

func (u *Service) Upload(ctx context.Context, ownerID uuid.UUID, title string, projectID *uuid.UUID, projectName string, reviewerID *uuid.UUID, filename string, file io.Reader) (*types.Document, error) {
	ext := strings.ToLower(filepath.Ext(filename))
	if ext != ".pdf" && ext != ".md" {
		return nil, errors.New("invalid file type: only .pdf and .md are allowed")
	}
	baseName := strings.TrimSuffix(filename, ext)
	uniqueFilename := fmt.Sprintf("%s-%s%s", baseName, uuid.New().String(), ext)

	// Persist data onto the volume path
	savedPath, err := u.storage.SaveFile(uniqueFilename, file)
	if err != nil {
		return nil, err
	}

	doc := &types.Document{
		ProjectID:   projectID,
		ProjectName: projectName,
		OwnerID:     ownerID,
		ReviewerID:  reviewerID,
		Title:       title,
		FileType:    strings.TrimPrefix(ext, "."),
		FileName:    uniqueFilename,
		Status:      "pending",
	}

	if err := u.repo.CreateDocument(ctx, doc, savedPath); err != nil {
		return nil, err
	}

	return doc, nil
}

func (u *Service) GetUserDashboard(ctx context.Context, userID uuid.UUID) ([]types.Document, error) {
	return u.repo.GetDocsByOwner(ctx, userID)
}

func (s *Service) AssignReviewer(ctx context.Context, docID uuid.UUID, reviewerID uuid.UUID) error {
	doc, err := s.repo.GetByID(ctx, docID)
	if err != nil {
		return err
	}

	if doc.OwnerID == reviewerID {
		return ErrSelfReviewNotAllowed
	}

	return s.repo.AssignReviewer(ctx, docID, reviewerID)
}
