# ---- 1. Build the frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- 2. Build the Go binary with embedded frontend ----
FROM golang:1.27-alpine AS backend-build
WORKDIR /src
RUN apk add --no-cache git
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
COPY --from=frontend-build /frontend/dist ./web/dist
RUN CGO_ENABLED=0 GOOS=linux go build -o /khub ./cmd/khub

# ---- 3. Minimal runtime image ----
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /
COPY --from=backend-build /khub /khub
RUN mkdir -p /data/uploads
EXPOSE 8080

ENTRYPOINT ["/khub"]