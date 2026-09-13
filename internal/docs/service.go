package docs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/google/uuid"
	"github.com/codimite-learning/knowledge-hub/internal/pkg/vector"
)

var (
	ErrDocumentNotFound     = errors.New("document not found")
	ErrSelfReviewNotAllowed = errors.New("you cannot assign yourself as a reviewer for your own document")
)

type Service struct {
	repo    Repository
	storage FileStorage
	vectorClient *vector.Client
	maxDistance float64
}

func NewService(repo Repository, storage FileStorage, vc *vector.Client, maxDistance float64) *Service {
	return &Service{repo: repo, storage: storage, vectorClient: vc, maxDistance: maxDistance}
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

func (s *Service) RemoveReviewer(ctx context.Context, docID uuid.UUID) error {
	if _, err := s.repo.GetByID(ctx, docID); err != nil {
		return err
	}
	return s.repo.RemoveReviewer(ctx, docID)
}

func (s *Service) ListReviewDocs(ctx context.Context, reviewerID uuid.UUID) ([]types.Document, error) {
	if reviewerID == uuid.Nil {
		return nil, errors.New("invalid reviewer id context")
	}
	return s.repo.ListReviewDocs(ctx, reviewerID)
}

func (s *Service) ProcessReviewWorkflow(ctx context.Context, docID, reviewerID uuid.UUID, status string) error {
	doc, err := s.repo.GetByID(ctx, docID)
	if err != nil {
		return fmt.Errorf("failed to fetch document metadata: %w", err)
	}

	var chunks []vector.Chunk
	var vectors [][]float32

	if status == "published" {
		var rawContent string

		switch doc.FileType {
		case "md":
			fileBytes, err := os.ReadFile(doc.FilePath)
			if err != nil {
				return fmt.Errorf("failed to read markdown file from internal volume: %w", err)
			}
			rawContent = string(fileBytes)

		case "pdf":
			extracted, err := vector.ExtractPDFText(doc.FilePath)
			if err != nil {
				rawContent = fmt.Sprintf("Title: %s. File: %s", doc.Title, doc.FileName)
			} else {
				rawContent = extracted
			}

		default:
			return fmt.Errorf("unsupported document file format type pipeline rule: %s", doc.FileType)
		}

		// Prefix with the document title for better semantic context.
		fullContent := fmt.Sprintf("title: %s\n\n%s", doc.Title, rawContent)

		// Chunk the content into overlapping segments.
		chunks = vector.ChunkText(fullContent)
		if len(chunks) == 0 {
			return fmt.Errorf("document produced zero chunks after processing")
		}

		// Extract text from each chunk for batch embedding.
		texts := make([]string, len(chunks))
		for i, c := range chunks {
			texts[i] = c.Content
		}

		vectors, err = s.vectorClient.GenerateVectors(ctx, texts)
		if err != nil {
			return fmt.Errorf("gemini embedding engine fault: %w", err)
		}
	}

	if err := s.repo.PublishDocumentWithVector(ctx, docID, reviewerID, status, chunks, vectors); err != nil {
		return fmt.Errorf("failed to update document review workflow state: %w", err)
	}

	return nil
}


func (s *Service) QueryArticlesBySemanticContext(ctx context.Context, queryTerm string, projectName string, limit int) ([]types.Document, []float64, error) {
	queryVector, err := s.vectorClient.GenerateVector(ctx, queryTerm, true)
	if err != nil {
		return nil, nil, fmt.Errorf("query tokenization failure: %w", err)
	}
	return s.repo.FindByVectorSimilarity(ctx, queryVector, projectName, s.maxDistance, limit)
}

func (s *Service) ListAllTags(ctx context.Context) ([]types.Tag, error) {
	return s.repo.ListAllTags(ctx)
}

func (s *Service) CreateTag(ctx context.Context, name string) (*types.Tag, error) {
	cleanName := strings.TrimSpace(name)
	if cleanName == "" {
		return nil, errors.New("tag name cannot be empty")
	}
	return s.repo.CreateTag(ctx, cleanName)
}

func (s *Service) AddTagsToDoc(ctx context.Context, docID uuid.UUID, tags []string) error {
	for _, tag := range tags {
		cleanTag := strings.TrimSpace(tag)
		if cleanTag == "" {
			continue
		}
		
		cleanTag = strings.ToLower(cleanTag)
		
		if err := s.repo.AddTagToDocument(ctx, docID, cleanTag); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) GetUserUploadsCount(ctx context.Context, ownerID uuid.UUID) (int, error) {
	if ownerID == uuid.Nil {
		return 0, errors.New("invalid owner identity context")
	}
	return s.repo.GetUploadsCount(ctx, ownerID)
}

func (s *Service) GetProjectPublishedCounts(ctx context.Context) (map[string]int, error) {
	return s.repo.GetPublishedCountsByProject(ctx)
}

func (s *Service) GetPublishedDocuments(ctx context.Context, projectName string) ([]types.Document, error) {
	if projectName == "" {
		projectName = "All projects"
	}
	return s.repo.GetPublishedByProject(ctx, projectName)
}