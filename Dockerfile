# ---- 1. build the frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY web/frontend/package.json web/frontend/package-lock.json ./
RUN npm ci
COPY web/frontend/ ./
RUN npm run build

# ---- 2. build the Go binary, embedding the frontend build ----
FROM golang:1.27-alpine AS backend-build
WORKDIR /src
RUN apk add --no-cache git
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
# Overwrite the placeholder dist/ with the real Vite build before go:embed runs.
COPY --from=frontend-build /frontend/dist ./web/dist
RUN CGO_ENABLED=0 GOOS=linux go build -o /khub ./cmd/khub

# ---- 3. minimal runtime image ----
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /
COPY --from=backend-build /khub /khub
EXPOSE 8080
ENTRYPOINT ["/khub"]
