package users

import (
	"context"

	"github.com/codimite-learning/knowledge-hub/internal/pkg/types"
	"github.com/google/uuid"
)

type Service struct {
	repo types.UserRepository
}

// NewService is the DI constructor.
func NewService(repo types.UserRepository) *Service {
	return &Service{repo: repo}
}

// GetOrCreateFromGoogle upserts a user from a verified Google profile. New
// users are always created with RoleUser, satisfying the acceptance
// criterion that any codimite.com user who signs in becomes a regular user.
func (s *Service) GetOrCreateFromGoogle(ctx context.Context, p types.GoogleProfile) (*types.User, error) {
	u := &types.User{
		Email:   p.Email,
		Name:    p.Name,
		Picture: p.Picture,
		Role:    types.RoleUser,
	}
	if err := s.repo.Upsert(ctx, u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*types.User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) ListTeammates(ctx context.Context, currentUserID uuid.UUID) ([]*types.User, error) {
	currentUser, err := s.repo.GetByID(ctx, currentUserID)
	if err != nil {
		return nil, err
	}

	allTeammates, err := s.repo.ListByRole(ctx, currentUser.Role)
	if err != nil {
		return nil, err
	}

	var filteredTeammates []*types.User
	for _, u := range allTeammates {
		if u.ID != currentUserID {
			filteredTeammates = append(filteredTeammates, u)
		}
	}

	if filteredTeammates == nil {
		filteredTeammates = make([]*types.User, 0)
	}

	return filteredTeammates, nil
}

