#!/usr/bin/env bash
set -Eeuo pipefail

compose_file="${1:?Usage: deploy-remote.sh <compose-file> [project-dir] [health-path]}"
project_dir="${2:-/root/StudentTracker}"
health_path="${3:-/api/health}"

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '::error::%s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command '$1' is not installed on the server."
}

require_file() {
  [ -f "$1" ] || fail "Required file '$1' was not found on the server."
}

require_dir() {
  [ -d "$1" ] || fail "Required directory '$1' was not found on the server."
}

dump_diagnostics() {
  local exit_code=$?

  if [ "$exit_code" -ne 0 ] && [ -d "$project_dir" ] && [ -f "$project_dir/.env" ] && [ -f "$project_dir/$compose_file" ]; then
    log "Deployment failed. Showing docker compose status and recent logs."
    (
      cd "$project_dir"
      docker compose --env-file .env -f "$compose_file" ps
    ) || true
    (
      cd "$project_dir"
      docker compose --env-file .env -f "$compose_file" logs --tail=100 backend frontend nginx postgres
    ) || true
  fi

  exit "$exit_code"
}

trap dump_diagnostics EXIT

require_cmd git
require_cmd docker
require_cmd curl

docker compose version >/dev/null 2>&1 || fail "Docker Compose plugin is not available on the server."
docker info >/dev/null 2>&1 || fail "Docker daemon is not reachable for the current user."

require_dir "$project_dir"
cd "$project_dir"

require_file ".env"
require_file "$compose_file"
require_dir "backend"
require_dir "frontend"
require_file ".github/scripts/deploy-remote.sh"

set -a
. ./.env
set +a

: "${BACKEND_PORT:?BACKEND_PORT must be set in .env}"
: "${NGINX_CONFIG_FILE:?NGINX_CONFIG_FILE must be set in .env}"

require_file "$NGINX_CONFIG_FILE"

log "Deploying commit $(git rev-parse --short HEAD) with compose file '$compose_file'."

docker compose --env-file .env -f "$compose_file" config >/dev/null
docker compose --env-file .env -f "$compose_file" down
docker compose --env-file .env -f "$compose_file" up -d --build --remove-orphans
docker compose --env-file .env -f "$compose_file" ps

curl --fail --retry 10 --retry-delay 5 "http://127.0.0.1:${BACKEND_PORT}${health_path}" >/dev/null

log "Health check passed."

trap - EXIT
