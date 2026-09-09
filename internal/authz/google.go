package authz

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var ErrDomainNotAllowed = errors.New("google account domain is not allowed")

// GoogleOAuth wraps the standard oauth2 config and enforces the
// "codimite.com only" acceptance criterion.
type GoogleOAuth struct {
	config        *oauth2.Config
	allowedDomain string
}

type GoogleUserInfo struct {
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	HD            string `json:"hd"`
}

// NewGoogleOAuth is the DI constructor; clientID/secret come from the
// Google Cloud Console OAuth client
func NewGoogleOAuth(clientID, clientSecret, redirectURL, allowedDomain string) *GoogleOAuth {
	return &GoogleOAuth{
		config: &oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectURL,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
		allowedDomain: allowedDomain,
	}
}

func (g *GoogleOAuth) AuthCodeURL(state string) string {
	return g.config.AuthCodeURL(state,
		oauth2.SetAuthURLParam("hd", g.allowedDomain),
		oauth2.AccessTypeOnline,
	)
}

// Exchange swaps the authorization code returned to the callback for an
// OAuth token.
func (g *GoogleOAuth) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return g.config.Exchange(ctx, code)
}

// GoogleUserInfo is the subset of the OIDC userinfo response we care about.
const googleUserInfoURL = "https://openidconnect.googleapis.com/v1/userinfo"

// FetchUserInfo calls Google's userinfo endpoint using the token we just
// received directly from Google's token endpoint over TLS, then enforces
// the allowed-domain acceptance criterion.
func (g *GoogleOAuth) FetchUserInfo(ctx context.Context, tok *oauth2.Token) (*GoogleUserInfo, error) {
	client := g.config.Client(ctx, tok)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, googleUserInfoURL, nil)
	if err != nil {
		return nil, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("userinfo request failed: %s: %s", resp.Status, string(body))
	}

	var info GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, err
	}

	if !info.EmailVerified {
		return nil, errors.New("google email is not verified")
	}

	domain := info.HD
	if domain == "" {
		parts := strings.SplitN(info.Email, "@", 2)
		if len(parts) == 2 {
			domain = parts[1]
		}
	}
	if !strings.EqualFold(domain, g.allowedDomain) {
		return nil, ErrDomainNotAllowed
	}

	return &info, nil
}

// GenerateState returns a URL-safe random string used as the OAuth `state`
// parameter (CSRF protection for the login flow).
func GenerateState() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
