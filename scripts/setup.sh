#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"

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
    if "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --env-file "$ROOT_DIR/.env" exec -T postgres pg_isready >/dev/null 2>&1; then
      echo "PostgreSQL listo."
      return 0
    fi

    echo "Esperando PostgreSQL... ($i/$retries)"
    sleep "$wait_seconds"
  done

  echo "Error: PostgreSQL no estuvo listo a tiempo."
  exit 1
}

ensure_env_file "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
ensure_env_file "$ROOT_DIR/nestjs-ecommerce/.env.example" "$ROOT_DIR/nestjs-ecommerce/.env"
ensure_env_file "$ROOT_DIR/frontend/.env.example" "$ROOT_DIR/frontend/.env"

echo "Levantando PostgreSQL..."
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --env-file "$ROOT_DIR/.env" up -d postgres

wait_for_postgres

if [[ "$MODE" == "dev" ]]; then
  echo "Ejecutando migraciones (dev)..."
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --profile dev run --rm backend-dev npm run migration:run

  echo "Ejecutando seed (dev)..."
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --profile dev run --rm backend-dev npm run seed:run

  echo "Iniciando stack docker en modo dev..."
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --profile dev up --build backend-dev frontend-dev
else
  echo "Build de imagenes (prod)..."
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --profile prod build backend frontend

  echo "Ejecutando migraciones (prod)..."
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --profile prod run --rm backend npm run migration:run:prod

  echo "Iniciando stack docker en modo prod..."
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" --profile prod up -d backend frontend

  echo "Stack prod activo."
  echo "Frontend: http://localhost:5173"
  echo "Backend:  http://localhost:3000"
  echo "Para ver logs: docker compose --profile prod logs -f"
fi
