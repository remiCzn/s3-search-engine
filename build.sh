#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$ROOT_DIR/dist"
STATIC_OUTPUT="$OUTPUT_DIR/static"
TARGET_INPUT="${BUILD_TARGET:-${1:-local}}"
TARGET="$(printf '%s' "$TARGET_INPUT" | tr '[:upper:]' '[:lower:]')"

rm -rf "$OUTPUT_DIR"
mkdir -p "$STATIC_OUTPUT"

if command -v yarn >/dev/null 2>&1; then
	cd "$ROOT_DIR/frontend"
	yarn install --frozen-lockfile
	yarn build
else
	echo "yarn is not available to build the frontend." >&2
	exit 1
fi

cd "$ROOT_DIR"
cp -R frontend/dist/. "$STATIC_OUTPUT/"
cp .env "$OUTPUT_DIR/"
cp pm2.json "$OUTPUT_DIR/"
case "$TARGET" in
    prod|production|linux)
        echo "Building backend for production (linux/amd64)..."
        GOOS=linux GOARCH=amd64 go build -o "$OUTPUT_DIR/s3search"
        ;;
    local|dev|development|host)
        LOCAL_GOOS="$(go env GOOS)"
        LOCAL_GOARCH="$(go env GOARCH)"
        echo "Building backend for local platform (${LOCAL_GOOS}/${LOCAL_GOARCH})..."
        go build -o "$OUTPUT_DIR/s3search"
        ;;
    *)
        echo "Unknown build target '$TARGET_INPUT'. Use 'local' or 'prod'." >&2
        exit 1
        ;;
esac
