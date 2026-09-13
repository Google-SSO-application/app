package vector

import (
	"context"
	"errors"
	"fmt"

	"google.golang.org/genai"
)

const (
	// EmbeddingModel is the Gemini embedding model used for all vector operations.
	EmbeddingModel = "gemini-embedding-2"
	// EmbeddingDimensions is the output dimensionality for generated embeddings.
	EmbeddingDimensions int32 = 3072
)

type Client struct {
	genaiClient *genai.Client
}

func NewClient(ctx context.Context, apiKey string) (*Client, error) {
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}
	return &Client{genaiClient: client}, nil
}

// GenerateVector generates a single embedding vector for the given text.
// Use isQuery=true for search queries, false for document content.
func (c *Client) GenerateVector(ctx context.Context, text string, isQuery bool) ([]float32, error) {
	var formattedContent string
	if isQuery {
		formattedContent = "task: search result | query: " + text
	} else {
		formattedContent = "title: none | text: " + text
	}

	contents := []*genai.Content{
		genai.NewContentFromText(formattedContent, genai.RoleUser),
	}

	result, err := c.genaiClient.Models.EmbedContent(
		ctx,
		EmbeddingModel,
		contents,
		&genai.EmbedContentConfig{
			OutputDimensionality: genai.Ptr(EmbeddingDimensions),
		},
	)
	if err != nil {
		return nil, err
	}

	if len(result.Embeddings) == 0 {
		return nil, errors.New("empty vector response payload returned from gemini engine")
	}

	return result.Embeddings[0].Values, nil
}

// GenerateVectors generates embedding vectors for multiple text chunks in a single API call.
// Returns one vector per input text, in the same order.
func (c *Client) GenerateVectors(ctx context.Context, texts []string) ([][]float32, error) {
	if len(texts) == 0 {
		return nil, nil
	}

	contents := make([]*genai.Content, len(texts))
	for i, text := range texts {
		formatted := "title: none | text: " + text
		contents[i] = genai.NewContentFromText(formatted, genai.RoleUser)
	}

	result, err := c.genaiClient.Models.EmbedContent(
		ctx,
		EmbeddingModel,
		contents,
		&genai.EmbedContentConfig{
			OutputDimensionality: genai.Ptr(EmbeddingDimensions),
		},
	)
	if err != nil {
		return nil, fmt.Errorf("batch embed content: %w", err)
	}

	if len(result.Embeddings) != len(texts) {
		return nil, fmt.Errorf("expected %d embeddings, got %d", len(texts), len(result.Embeddings))
	}

	vectors := make([][]float32, len(result.Embeddings))
	for i, emb := range result.Embeddings {
		vectors[i] = emb.Values
	}

	return vectors, nil
}