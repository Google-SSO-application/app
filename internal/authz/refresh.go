package authz

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")

type RefreshTokenIssuer struct {
	secret []byte
	ttl    time.Duration
}

type RefreshClaims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func NewRefreshTokenIssuer(secret string, ttl time.Duration) *RefreshTokenIssuer {
	return &RefreshTokenIssuer{secret: []byte(secret), ttl: ttl}
}

func (r *RefreshTokenIssuer) TTL() time.Duration { return r.ttl }

func (r *RefreshTokenIssuer) Issue(userID uuid.UUID, email string) (string, error) {
	now := time.Now()
	claims := RefreshClaims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(r.ttl)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(r.secret)
}

func (r *RefreshTokenIssuer) Validate(tokenStr string) (uuid.UUID, string, error) {
	claims := &RefreshClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidRefreshToken
		}
		return r.secret, nil
	})
	if err != nil || !token.Valid {
		return uuid.Nil, "", ErrInvalidRefreshToken
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return uuid.Nil, "", ErrInvalidRefreshToken
	}
	return userID, claims.Email, nil
}
