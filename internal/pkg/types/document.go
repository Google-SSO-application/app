package types

import (
	"time"

	"github.com/google/uuid"
)

type Project struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	ProjectName string    `json:"project_name"`
	CreatedAt   time.Time `json:"created_at"`
}

type Tag struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type Document struct {
	ID              uuid.UUID  `json:"id"`
	ProjectID       *uuid.UUID `json:"project_id"`
	ProjectName     string     `json:"project_name"`
	ProjectCategory string     `json:"project_category"`
	OwnerID         uuid.UUID  `json:"owner_id"`
	ReviewerID      *uuid.UUID `json:"reviewer_id"`
	Title           string     `json:"title"`
	FileType        string     `json:"file_type"` // "pdf" or "md"
	FilePath        string     `json:"-"`         // Internal filesystem route
	FileName        string     `json:"file_name"` // Name of the file
	Status          string     `json:"status"`    // "pending" or "published"
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	Tags            []string   `json:"tags,omitempty"`
}
