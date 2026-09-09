package vector

import (
	"context"
	"errors"
	"google.golang.org/genai"
)

type Client struct {
	genaiClient *genai.Client
}

func NewClient(ctx context.Context) (*Client, error) {
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return nil, err
	}
	return &Client{genaiClient: client}, nil
}

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
		"gemini-embedding-2",
		contents,
		&genai.EmbedContentConfig{
			OutputDimensionality: genai.Ptr[int32](1536),
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
