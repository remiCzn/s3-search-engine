package index

import (
	"bufio"
	"context"
	"io"
	"log"
	"strings"

	"github.com/blevesearch/bleve/v2"
	"github.com/minio/minio-go/v7"
)

type Index struct {
	index bleve.Index
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

	return &Index{index: bleveIndex}
}

const CONTENT_FIELD = "content"

func (i *Index) IndexObject(ctx context.Context, mc *minio.Client, bucket, key string) error {
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
