package docs

import (
	"io"
	"os"
	"path/filepath"
)

// FileStorage defines the capability to write a data stream to disk
type FileStorage interface {
	SaveFile(filename string, src io.Reader) (string, error)
}

// LocalStorage satisfies the FileStorage interface using the container volume filesystem
type LocalStorage struct {
	uploadDir string
}

func NewLocalStorage(uploadDir string) (*LocalStorage, error) {
	// Create the directory path recursively if it doesn't exist yet
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, err
	}
	return &LocalStorage{uploadDir: uploadDir}, nil
}

func (s *LocalStorage) SaveFile(filename string, src io.Reader) (string, error) {
	destPath := filepath.Join(s.uploadDir, filename)
	dst, err := os.Create(destPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return "", err
	}
	return destPath, nil
}
