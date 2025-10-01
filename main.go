package main

import (
	"log"
	"net/http"
	"os"

	"s3search/app/api"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	d := api.New(
		os.Getenv("MINIO_ENDPOINT"),
		os.Getenv("MINIO_ACCESS_KEY"),
		os.Getenv("MINIO_SECRET_KEY"),
		os.Getenv("MINIO_BUCKET"),
		os.Getenv("INDEX_PATH"),
	)

	api := &api.API{Index: d.Index, Minio: d.Minio, Bucket: d.Bucket}
	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe("localhost:8080", api.Routes()))
}
