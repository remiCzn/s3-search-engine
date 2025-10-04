package api

import (
	"encoding/json"
	"net/http"
	"strconv"
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
	r.Use(corsMiddleware)
	r.Get("/search", a.search)
	r.Get("/download", a.download)
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
