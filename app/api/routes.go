package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/minio/minio-go/v7"
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
	r.Get("/search", a.search)
	r.Get("/download", a.download)
	r.Post("/reindex", a.reindex)
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

// déclenche un backfill (simple)
func (a *API) reindex(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	ch := a.Minio.ListObjects(ctx, a.Bucket, minio.ListObjectsOptions{Recursive: true})
	count := 0
	for obj := range ch {
		if obj.Err != nil {
			continue
		}

		_ = a.Index.IndexObject(ctx, a.Minio, a.Bucket, obj.Key)
		count++
	}
	writeJSON(w, map[string]int{"indexed": count})
}
