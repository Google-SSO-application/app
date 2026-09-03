# ---- 1. Build the Go binary ----
FROM golang:1.22-alpine AS backend-build
WORKDIR /src

# Install git if needed for private dependencies
RUN apk add --no-cache git

# Cache Go modules first for faster rebuilds
COPY go.mod go.sum* ./
RUN go mod download

# Copy the entire project source code
COPY . .

# Build the production-ready static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /khub ./cmd/khub

# ---- 2. Minimal runtime image ----
FROM alpine:3.19
RUN apk add --no-cache ca-certificates

WORKDIR /

# Copy the compiled binary from the build stage
COPY --from=backend-build /khub /khub

EXPOSE 8080
ENTRYPOINT ["/khub"]
