package web

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"

	"github.com/codimite-learning/knowledge-hub/internal/authz"
	"github.com/codimite-learning/knowledge-hub/internal/docs"
	"github.com/codimite-learning/knowledge-hub/internal/projects"
	"github.com/codimite-learning/knowledge-hub/internal/users"
)

func NewRouter(
	authHandler *authz.Handler,
	accessIssuer *authz.AccessTokenIssuer,
	spaHandler http.Handler,
	docsHandler *docs.HttpHandler,
	projectsHandler *projects.HttpHandler,
	uploadDir string,
	usersHandler *users.HttpHandler,
) http.Handler {
	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Timeout(30 * time.Second))
	r.Use(authz.Middleware(accessIssuer))

	r.Route("/web", func(r chi.Router) {
		r.Get("/auth/google/login", authHandler.HandleGoogleLogin)
		r.Get("/auth/google/callback", authHandler.HandleGoogleCallback)
		r.Post("/auth/refresh", authHandler.HandleRefresh)
		r.Post("/auth/logout", authHandler.HandleLogout)

		r.Group(func(r chi.Router) {
			r.Use(authz.RequireAuth)
			r.Get("/me", authHandler.HandleMe)

			// Project Routes
			r.Post("/projects", projectsHandler.CreateHandler)
			r.Get("/projects", projectsHandler.ListHandler)

			// Document Routes
			r.Post("/docs/upload", docsHandler.UploadHandler)
			r.Get("/docs/dashboard", docsHandler.ListUserDocsHandler)
			r.Post("/docs/assign-reviewer", docsHandler.AssignReviewerHandler)
			r.Post("/docs/remove-reviewer", docsHandler.RemoveReviewerHandler)
			r.Get("/docs/reviews", docsHandler.ListReviewDocsHandler)
			r.Post("/docs/reviews/status", docsHandler.UpdateReviewStatusHandler)
			r.Get("/tags", docsHandler.ListTagsHandler) 
			r.Post("/tags", docsHandler.CreateGlobalTagHandler)
			r.Post("/docs/tags", docsHandler.CreateDocTagsHandler)
			r.Get("/docs/count", docsHandler.GetCountHandler) 

			// User Directory Operations
			r.Get("/users/teammates", usersHandler.ListTeammatesHandler)
		})

		fileServer := http.FileServer(http.Dir(uploadDir))
		r.Handle("/uploads/*", http.StripPrefix("/web/uploads", fileServer))
	})

	r.NotFound(spaHandler.ServeHTTP)
	r.Handle("/*", spaHandler)

	return r
}
