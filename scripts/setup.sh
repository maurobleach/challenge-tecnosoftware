#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/nestjs-ecommerce"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
VITE_API_URL_PROD="${VITE_API_URL_PROD:-http://localhost:${BACKEND_PORT}}"

if [[ "$MODE" != "dev" && "$MODE" != "prod" ]]; then
  echo "Uso: ./scripts/setup.sh [dev|prod]"
  exit 1
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Error: se requiere docker compose o docker-compose instalado."
  exit 1
fi

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: no se encontro el comando requerido '$cmd'."
    exit 1
  fi
}

ensure_env_file() {
  local example_file="$1"
  local target_file="$2"
  if [[ ! -f "$target_file" && -f "$example_file" ]]; then
    cp "$example_file" "$target_file"
    echo "Creado $target_file desde $example_file"
  fi
}

wait_for_postgres() {
  local retries=30
  local wait_seconds=2

  for ((i = 1; i <= retries; i++)); do
    if "${COMPOSE_CMD[@]}" -f "$ROOT_DIR/docker-compose.yml" exec -T postgres pg_isready >/dev/null 2>&1; then
      echo "PostgreSQL listo."
      return 0
    fi

    echo "Esperando PostgreSQL... ($i/$retries)"
    sleep "$wait_seconds"
  done

  echo "Error: PostgreSQL no estuvo listo a tiempo."
  exit 1
}

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
}

start_dev() {
  echo "Iniciando backend en modo dev..."
  (
    cd "$BACKEND_DIR"
    npm run start:dev
  ) &
  BACKEND_PID=$!

  echo "Iniciando frontend en modo dev..."
  (
    cd "$FRONTEND_DIR"
    npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
  ) &
  FRONTEND_PID=$!

  wait -n "$BACKEND_PID" "$FRONTEND_PID"
}

start_prod() {
  echo "Build backend..."
  (
    cd "$BACKEND_DIR"
    npm run build
  )

  echo "Build frontend..."
  (
    cd "$FRONTEND_DIR"
    VITE_API_URL="$VITE_API_URL_PROD" npm run build
  )

  echo "Iniciando backend en modo prod..."
  (
    cd "$BACKEND_DIR"
    PORT="$BACKEND_PORT" npm run start:prod
  ) &
  BACKEND_PID=$!

  echo "Iniciando frontend en modo prod..."
  (
    cd "$FRONTEND_DIR"
    PORT="$FRONTEND_PORT" npm run start
  ) &
  FRONTEND_PID=$!

  wait -n "$BACKEND_PID" "$FRONTEND_PID"
}

trap cleanup EXIT INT TERM

require_command npm
require_command docker

ensure_env_file "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
ensure_env_file "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
ensure_env_file "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"

echo "Instalando dependencias backend..."
(
  cd "$BACKEND_DIR"
  npm ci
)

echo "Instalando dependencias frontend..."
(
  cd "$FRONTEND_DIR"
  npm ci
)

echo "Levantando PostgreSQL con Docker..."
"${COMPOSE_CMD[@]}" -f "$ROOT_DIR/docker-compose.yml" --env-file "$ROOT_DIR/.env" up -d postgres

wait_for_postgres

echo "Ejecutando migraciones..."
(
  cd "$BACKEND_DIR"
  npm run migration:run
)

if [[ "$MODE" == "dev" ]]; then
  echo "Ejecutando seed en modo dev..."
  (
    cd "$BACKEND_DIR"
    npm run seed:run
  )
  start_dev
else
  start_prod
fi