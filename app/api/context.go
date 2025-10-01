package api

import (
	"log"
	"s3search/app/index"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type API struct {
	Minio  *minio.Client
	Index  *index.Index
	Bucket string
}

func New(endpoint string, access string, secret string, bucket string, indexPath string) *API {
	cl, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(access, secret, ""),
		Secure: true,
	})
	if err != nil {
		log.Fatal(err)
	}

	appIndex := index.New(indexPath)

	return &API{Minio: cl, Index: appIndex, Bucket: bucket}
}
