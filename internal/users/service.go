package users

import (
	"context"

	"github.com/google/uuid"
)

type Service struct {
	repo Repository
}

// NewService is the DI constructor.
func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

// GetOrCreateFromGoogle upserts a user from a verified Google profile. New
// users are always created with RoleUser, satisfying the acceptance
// criterion that any codimite.com user who signs in becomes a regular user.
func (s *Service) GetOrCreateFromGoogle(ctx context.Context, p GoogleProfile) (*User, error) {
	u := &User{
		Email:   p.Email,
		Name:    p.Name,
		Picture: p.Picture,
		Role:    RoleUser,
	}
	if err := s.repo.Upsert(ctx, u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	return s.repo.GetByID(ctx, id)
}
