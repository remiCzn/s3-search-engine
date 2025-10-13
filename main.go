package main

import (
	"log"
	"net/http"
	"os"
	"strconv"

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
		os.Getenv("PORT"),
	)

	api := &api.API{Index: d.Index, Minio: d.Minio, Bucket: d.Bucket}
	log.Println("listening on :", d.Port)
	log.Fatal(http.ListenAndServe("localhost:"+strconv.Itoa(d.Port), api.Routes()))
}
