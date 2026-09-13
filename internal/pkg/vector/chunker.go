package vector

import (
	"strings"
	"unicode/utf8"
)

// Chunk represents a segment of a document with its position index.
type Chunk struct {
	Index   int
	Content string
}

const (
	// chunkSize is the target size in characters for each chunk (~800 tokens).
	chunkSize = 3200
	// chunkOverlap is the number of overlap characters between adjacent chunks (~200 tokens).
	chunkOverlap = 800
)

func ChunkText(text string) []Chunk {
	text = strings.TrimSpace(text)
	if text == "" {
		return nil
	}

	// If the entire text fits in one chunk, return it directly.
	if utf8.RuneCountInString(text) <= chunkSize {
		return []Chunk{{Index: 0, Content: text}}
	}

	paragraphs := splitParagraphs(text)
	var chunks []Chunk
	var current strings.Builder
	currentLen := 0

	flush := func() {
		content := strings.TrimSpace(current.String())
		if content != "" {
			chunks = append(chunks, Chunk{Index: len(chunks), Content: content})
		}
	}

	for _, para := range paragraphs {
		para = strings.TrimSpace(para)
		if para == "" {
			continue
		}

		paraLen := utf8.RuneCountInString(para)

		// If this single paragraph exceeds the chunk size, split it further by sentences.
		if paraLen > chunkSize {
			flush()
			current.Reset()
			currentLen = 0

			sentenceChunks := splitLargeParagraph(para)
			for _, sc := range sentenceChunks {
				chunks = append(chunks, Chunk{Index: len(chunks), Content: sc})
			}
			continue
		}

		// If adding this paragraph would exceed the chunk size, flush and start a new chunk.
		if currentLen+paraLen+2 > chunkSize && currentLen > 0 {
			flush()

			// Build the overlap from the end of the current chunk.
			overlap := extractOverlap(current.String(), chunkOverlap)
			current.Reset()
			currentLen = 0

			if overlap != "" {
				current.WriteString(overlap)
				current.WriteString("\n\n")
				currentLen = utf8.RuneCountInString(overlap) + 2
			}
		}

		if currentLen > 0 {
			current.WriteString("\n\n")
			currentLen += 2
		}
		current.WriteString(para)
		currentLen += paraLen
	}

	flush()

	// Ensure there's at least one chunk even if all paragraphs were empty after trimming.
	if len(chunks) == 0 && text != "" {
		return []Chunk{{Index: 0, Content: text}}
	}

	return chunks
}

// splitParagraphs splits text on double newlines (paragraph boundaries).
func splitParagraphs(text string) []string {
	// Normalize line endings.
	text = strings.ReplaceAll(text, "\r\n", "\n")
	return strings.Split(text, "\n\n")
}

// splitLargeParagraph breaks an oversized paragraph into chunks by sentence boundaries.
func splitLargeParagraph(para string) []string {
	sentences := splitSentences(para)
	var result []string
	var current strings.Builder
	currentLen := 0

	for _, sent := range sentences {
		sent = strings.TrimSpace(sent)
		if sent == "" {
			continue
		}
		sentLen := utf8.RuneCountInString(sent)

		// A single sentence larger than the chunk size — hard split it.
		if sentLen > chunkSize {
			if currentLen > 0 {
				content := strings.TrimSpace(current.String())
				if content != "" {
					result = append(result, content)
				}
				current.Reset()
				currentLen = 0
			}
			result = append(result, hardSplit(sent)...)
			continue
		}

		if currentLen+sentLen+1 > chunkSize && currentLen > 0 {
			content := strings.TrimSpace(current.String())
			if content != "" {
				result = append(result, content)
			}

			overlap := extractOverlap(current.String(), chunkOverlap)
			current.Reset()
			currentLen = 0
			if overlap != "" {
				current.WriteString(overlap)
				current.WriteString(" ")
				currentLen = utf8.RuneCountInString(overlap) + 1
			}
		}

		if currentLen > 0 {
			current.WriteString(" ")
			currentLen++
		}
		current.WriteString(sent)
		currentLen += sentLen
	}

	if currentLen > 0 {
		content := strings.TrimSpace(current.String())
		if content != "" {
			result = append(result, content)
		}
	}

	return result
}

// splitSentences does a simple sentence split on common sentence terminators.
func splitSentences(text string) []string {
	var sentences []string
	var current strings.Builder

	runes := []rune(text)
	for i := 0; i < len(runes); i++ {
		current.WriteRune(runes[i])

		if runes[i] == '.' || runes[i] == '!' || runes[i] == '?' {
			// Check if followed by a space or end of text — treat as sentence boundary.
			if i+1 >= len(runes) || runes[i+1] == ' ' || runes[i+1] == '\n' || runes[i+1] == '\t' {
				sentences = append(sentences, current.String())
				current.Reset()
			}
		}
	}

	if current.Len() > 0 {
		sentences = append(sentences, current.String())
	}

	return sentences
}

// hardSplit breaks a string into fixed-size rune-based chunks as a last resort.
func hardSplit(text string) []string {
	runes := []rune(text)
	var parts []string
	step := chunkSize - chunkOverlap
	if step <= 0 {
		step = chunkSize
	}

	for i := 0; i < len(runes); {
		end := i + chunkSize
		if end > len(runes) {
			end = len(runes)
		}
		parts = append(parts, string(runes[i:end]))
		i += step
	}

	return parts
}

// extractOverlap returns the last n runes of text for use as overlap context.
func extractOverlap(text string, n int) string {
	runes := []rune(text)
	if len(runes) <= n {
		return text
	}

	// Try to start the overlap at a word boundary.
	start := len(runes) - n
	for i := start; i < start+100 && i < len(runes); i++ {
		if runes[i] == ' ' || runes[i] == '\n' {
			return strings.TrimSpace(string(runes[i+1:]))
		}
	}

	return strings.TrimSpace(string(runes[start:]))
}