package vector

import (
	"context"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

type Client struct {
	apiKey     string
	apiURL     string
	httpClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:     apiKey,
		apiURL:     "https://openai.com",
		httpClient: &http.Client{},
	}
}

// GenerateVector transforms text strings into a 1536 float32 array
func (c *Client) GenerateVector(ctx context.Context, text string) ([]float32, error) {
	reqBody, _ := json.Marshal(map[string]any{
		"input": text,
		"model": "text-embedding-3-small",
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.apiURL, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiKey))

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("embedding service error status code: %d", resp.StatusCode)
	}

	var res struct {
		Data []struct {
			Embedding []float32 `json:"embedding"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}

	if len(res.Data) == 0 {
		return nil, errors.New("empty vector response payload returned from embedding engine")
	}

	return res.Data[0].Embedding, nil
}
