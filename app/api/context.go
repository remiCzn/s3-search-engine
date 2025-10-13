package api

import (
	"context"
	"log"
	"s3search/app/index"
	"strconv"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type API struct {
	Minio  *minio.Client
	Index  *index.Index
	Bucket string
	Port   int
}

func New(endpoint string, access string, secret string, bucket string, indexPath string, port string) *API {
	cl, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(access, secret, ""),
		Secure: true,
	})
	if err != nil {
		log.Fatal(err)
	}

	appIndex := index.New(indexPath)

	portInt, err := strconv.Atoi(port)
	if err != nil {
		log.Fatal(err)
	}

	api := &API{Minio: cl, Index: appIndex, Bucket: bucket, Port: portInt}
	api.Index.StartBackgroundIndexing(context.Background(), 5*time.Minute, api.Minio, api.Bucket)

	return api
}
