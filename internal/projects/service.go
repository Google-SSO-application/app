package projects

import (
	"context"
	"errors"
	"strings"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/google/uuid"
)

var (
	ErrNameRequired = errors.New("project name is required")
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(ctx context.Context, createdBy uuid.UUID, name string, description string) (*types.Project, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, ErrNameRequired
	}

	project := &types.Project{
		Name:        name,
		Description: strings.TrimSpace(description),
		CreatedBy:   &createdBy,
	}
	if err := s.repo.Create(ctx, project); err != nil {
		return nil, err
	}
	return project, nil
}

func (s *Service) List(ctx context.Context) ([]*types.Project, error) {
	return s.repo.List(ctx)
}
