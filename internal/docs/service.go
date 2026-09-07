package docs

import (
	"context"
	"errors"
	"io"
	"fmt"
	"path/filepath"
	"strings"
	"github.com/google/uuid"
	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
)

type Service struct {
	repo    Repository
	storage FileStorage
}

func NewService(repo Repository, storage FileStorage) *Service {
	return &Service{repo: repo, storage: storage}
}

func (u *Service) Upload(ctx context.Context, ownerID uuid.UUID, title string, projectID *uuid.UUID, reviewerID *uuid.UUID, filename string, file io.Reader) (*types.Document, error) {
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
		ProjectID:  projectID,
		OwnerID:    ownerID,
		ReviewerID: reviewerID,
		Title:      title,
		FileType:   strings.TrimPrefix(ext, "."),
		FileName:   uniqueFilename,
		Status:     "pending",
	}

	if err := u.repo.CreateDocument(ctx, doc, savedPath); err != nil {
		return nil, err
	}

	return doc, nil
}

func (u *Service) GetUserDashboard(ctx context.Context, userID uuid.UUID) ([]types.Document, error) {
	return u.repo.GetDocsByOwner(ctx, userID)
}
