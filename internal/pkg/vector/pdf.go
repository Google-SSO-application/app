package vector

import (
	"fmt"
	"io"
	"strings"

	lpdf "github.com/ledongthuc/pdf"
)

// ExtractPDFText reads a PDF file from the given path and extracts all text content.
func ExtractPDFText(filePath string) (string, error) {
	f, r, err := lpdf.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("open pdf: %w", err)
	}
	defer f.Close()

	totalPages := r.NumPage()
	if totalPages == 0 {
		return "", nil
	}

	var buf strings.Builder
	for i := 1; i <= totalPages; i++ {
		page := r.Page(i)
		if page.V.IsNull() {
			continue
		}

		text, err := page.GetPlainText(nil)
		if err != nil {
			// Skip pages that can't be parsed rather than failing entirely.
			continue
		}
		if text != "" {
			if buf.Len() > 0 {
				buf.WriteString("\n\n")
			}
			buf.WriteString(text)
		}
	}

	result := strings.TrimSpace(buf.String())
	if result == "" {
		return "", fmt.Errorf("no extractable text found in pdf (may be image-based)")
	}

	return result, nil
}

// ExtractPDFTextFromReader reads a PDF from an io.ReaderAt with the given size
// and extracts all text content.
func ExtractPDFTextFromReader(reader io.ReaderAt, size int64) (string, error) {
	r, err := lpdf.NewReader(reader, size)
	if err != nil {
		return "", fmt.Errorf("read pdf: %w", err)
	}

	totalPages := r.NumPage()
	if totalPages == 0 {
		return "", nil
	}

	var buf strings.Builder
	for i := 1; i <= totalPages; i++ {
		page := r.Page(i)
		if page.V.IsNull() {
			continue
		}

		text, err := page.GetPlainText(nil)
		if err != nil {
			continue
		}
		if text != "" {
			if buf.Len() > 0 {
				buf.WriteString("\n\n")
			}
			buf.WriteString(text)
		}
	}

	result := strings.TrimSpace(buf.String())
	if result == "" {
		return "", fmt.Errorf("no extractable text found in pdf (may be image-based)")
	}

	return result, nil
}