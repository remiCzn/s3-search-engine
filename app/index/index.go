package index

import (
	"bufio"
	"context"
	"io"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/blevesearch/bleve/v2"
	"github.com/minio/minio-go/v7"
)

type Index struct {
	index bleve.Index

	mappedMu sync.RWMutex
	mapped   map[string]string

	indexingMu sync.Mutex
	indexing   bool
}

func New(indexPath string) *Index {

	var bleveIndex bleve.Index
	if i, err := bleve.Open(indexPath); err == nil {
		bleveIndex = i
	} else {
		contentFieldMapping := bleve.NewTextFieldMapping()
		contentFieldMapping.Store = false
		contentFieldMapping.IncludeTermVectors = false
		contentFieldMapping.IncludeInAll = true
		// contentFieldMapping.Analyzer = "simple"

		docMapping := bleve.NewDocumentMapping()
		docMapping.AddFieldMappingsAt(CONTENT_FIELD, contentFieldMapping)

		indexMapping := bleve.NewIndexMapping()
		indexMapping.DefaultMapping = docMapping
		// indexMapping.DefaultAnalyzer = "simple"

		bleveIndex, err = bleve.New(indexPath, indexMapping)
		if err != nil {
			log.Fatal(err)
		}
	}

	return &Index{index: bleveIndex, mapped: make(map[string]string)}
}

const CONTENT_FIELD = "content"

func (i *Index) indexObject(ctx context.Context, mc *minio.Client, bucket, key string) error {
	obj, err := mc.GetObject(ctx, bucket, key, minio.GetObjectOptions{})
	if err != nil {
		return err
	}
	defer obj.Close()

	st, err := obj.Stat()
	if err != nil {
		return err
	}
	// filter non-text files
	if !strings.HasPrefix(st.ContentType, "text/") {
		return nil
	}

	var b strings.Builder
	reader := bufio.NewReader(io.LimitReader(obj, 10<<20)) // 10 MiB
	for {
		chunk, err := reader.ReadString('\n')
		b.WriteString(chunk)
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
	}

	doc := map[string]interface{}{
		CONTENT_FIELD: b.String(),
	}

	return i.index.Index(bucket+":"+key, doc)
}

func (i *Index) DeleteObject(bucket, key string) error {
	return i.index.Delete(bucket + ":" + key)
}

func (i *Index) Search(q string, limit int, from int) (*bleve.SearchResult, error) {
	query := bleve.NewMatchQuery(q)
	query.SetField(CONTENT_FIELD)

	req := bleve.NewSearchRequestOptions(query, limit, from, false)

	req.Fields = []string{"content"}

	return i.index.Search(req)
}

func (a *Index) StartBackgroundIndexing(ctx context.Context, interval time.Duration, m *minio.Client, bucket string) {
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			a.runIndexing(ctx, m, bucket)

			select {
			case <-ticker.C:
				if ctx.Err() != nil {
					return
				}
			case <-ctx.Done():
				return
			}
		}
	}()
}

func (a *Index) runIndexing(ctx context.Context, m *minio.Client, bucket string) {
	if !a.beginIndexing() {
		log.Printf("background index: previous scan still running, skipping")
		return
	}
	defer a.endIndexing()

	a.syncBucket(ctx, m, bucket)
}

func (a *Index) beginIndexing() bool {
	a.indexingMu.Lock()
	defer a.indexingMu.Unlock()
	if a.indexing {
		return false
	}
	a.indexing = true
	return true
}

func (a *Index) endIndexing() {
	a.indexingMu.Lock()
	a.indexing = false
	a.indexingMu.Unlock()
}

func (a *Index) syncBucket(ctx context.Context, m *minio.Client, bucket string) {
	log.Printf("background index: starting scan for bucket %q", bucket)
	objs := m.ListObjects(ctx, bucket, minio.ListObjectsOptions{Recursive: true})
	seen := make(map[string]string)
	hadErrors := false

	for obj := range objs {
		if ctx.Err() != nil {
			return
		}
		if obj.Err != nil {
			hadErrors = true
			log.Printf("background index: failed to list %q: %v", obj.Key, obj.Err)
			continue
		}

		seen[obj.Key] = obj.ETag

		if a.needsIndex(obj.Key, obj.ETag) {
			if err := a.indexObject(ctx, m, bucket, obj.Key); err != nil {
				log.Printf("background index: failed to index %q: %v", obj.Key, err)
				continue
			}
			a.markIndexed(obj.Key, obj.ETag)
		}
	}

	if hadErrors {
		return
	}

	a.removeMissing(seen, bucket)
}

func (a *Index) needsIndex(key, etag string) bool {
	a.mappedMu.RLock()
	stored, ok := a.mapped[key]
	a.mappedMu.RUnlock()
	return !ok || stored != etag
}

func (a *Index) markIndexed(key, etag string) {
	a.mappedMu.Lock()
	a.mapped[key] = etag
	a.mappedMu.Unlock()
}

func (a *Index) removeMissing(seen map[string]string, bucket string) {
	var toDelete []string

	a.mappedMu.Lock()
	for key := range a.mapped {
		if _, ok := seen[key]; !ok {
			toDelete = append(toDelete, key)
			delete(a.mapped, key)
		}
	}
	a.mappedMu.Unlock()

	for _, key := range toDelete {
		if err := a.DeleteObject(bucket, key); err != nil {
			log.Printf("background index: failed to delete %q from index: %v", key, err)
		}
	}
}
