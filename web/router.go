package web

import (
	"fmt"
	"net/http"

	"app/internal/authz"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/", authz.HandleHome)
	mux.HandleFunc("/auth/login", authz.HandleLogin)
	mux.HandleFunc("/auth/callback", authz.HandleCallback)

	fmt.Println("Server started at http://localhost:8080")
	return mux
}