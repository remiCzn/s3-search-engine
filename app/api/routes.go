package api

import (
	"encoding/json"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

func writeJSON(w http.ResponseWriter, v any, status ...int) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if len(status) > 0 {
		w.WriteHeader(status[0])
	}
	_ = json.NewEncoder(w).Encode(v)
}

func (a *API) Routes() http.Handler {
	r := chi.NewRouter()

	r.Route("/api", func(r chi.Router) {
		r.Use(corsMiddleware)
		r.Get("/search", a.search)
		r.Get("/download", a.download)
	})

	if a.StaticDir != "" {
		if _, err := os.Stat(filepath.Join(a.StaticDir, "index.html")); err == nil {
			h := spaHandler(a.StaticDir)
			r.Get("/", h)
			r.Head("/", h)
			r.Get("/*", h)
			r.Head("/*", h)
		}
	}

	return r
}

func (a *API) search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		http.Error(w, "q required", 400)
		return
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	from, _ := strconv.Atoi(r.URL.Query().Get("from"))

	res, err := a.Index.Search(q, limit, from)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	writeJSON(w, res)
}

func (a *API) download(w http.ResponseWriter, r *http.Request) {
	key := r.URL.Query().Get("key")
	if key == "" {
		http.Error(w, "key required", 400)
		return
	}
	u, err := a.Minio.PresignedGetObject(r.Context(), a.Bucket, key, 10*time.Minute, nil)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	http.Redirect(w, r, u.String(), http.StatusFound)
}

func spaHandler(staticDir string) http.HandlerFunc {
	fileServer := http.FileServer(http.Dir(staticDir))
	indexPath := filepath.Join(staticDir, "index.html")

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		requestPath := r.URL.Path
		if requestPath == "" || requestPath == "/" {
			http.ServeFile(w, r, indexPath)
			return
		}

		cleanPath := path.Clean(requestPath)
		cleanPath = strings.TrimPrefix(cleanPath, "/")
		candidate := filepath.Join(staticDir, cleanPath)
		if info, err := os.Stat(candidate); err == nil && !info.IsDir() {
			fileServer.ServeHTTP(w, r)
			return
		}

		http.ServeFile(w, r, indexPath)
	}
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
