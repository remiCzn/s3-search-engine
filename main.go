package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"s3search/app/api"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		if exe, err := os.Executable(); err == nil {
			exeDir := filepath.Dir(exe)
			candidate := filepath.Join(exeDir, "static")
			if info, err := os.Stat(candidate); err == nil && info.IsDir() {
				staticDir = candidate
			}
		}
	}
	if staticDir == "" {
		staticDir = filepath.Join("frontend", "dist")
	}

	d := api.New(
		os.Getenv("MINIO_ENDPOINT"),
		os.Getenv("MINIO_ACCESS_KEY"),
		os.Getenv("MINIO_SECRET_KEY"),
		os.Getenv("MINIO_BUCKET"),
		os.Getenv("INDEX_PATH"),
		os.Getenv("PORT"),
		staticDir,
	)

	log.Println("listening on :", d.Port)
	log.Fatal(http.ListenAndServe("localhost:"+strconv.Itoa(d.Port), d.Routes()))
}
