# Challenge TecnoSoftware

Configuracion fullstack para ejecutar frontend React/Vite y backend NestJS con PostgreSQL, todo dockerizado.

## Stack

- Frontend: React + Vite + React Router
- Backend: NestJS + TypeORM
- Base de datos: PostgreSQL 15
- Orquestacion: Docker Compose

## Problemas iniciales detectados

- Problemas de seguridad en la gestion de autenticacion.
- Configuracion incorrecta de variables de entorno, afectando la conexion a base de datos.
- Errores de tipado en entidades clave (por ejemplo User y Category).
- Uso incorrecto de decoradores en la entidad Product.
- Logica de Inventory inexistente o incompleta.
- Errores en migraciones (nombres de columnas inconsistentes en Inventory).
- Entidades sin dominio claro o baja integracion con el flujo principal.

## Decisiones tecnicas

- Se mantuvo un monolito modular para reducir complejidad innecesaria.
- Se implemento un enfoque event-driven interno mediante eventos de dominio.
- Se desacoplo Product de Inventory usando eventos para reducir acoplamiento entre modulos.
- Se incorporo endpoint para categorias precargadas por migracion.
- Se completo la logica de Inventory alineada con el dominio ecommerce.
- Se priorizo simplicidad operativa con un unico script para dev y prod.

## Implementacion de eventos

- `product.created`: crea automaticamente un registro de inventario al crear producto.
- `product.activated`: se dispara cuando el producto cumple informacion minima requerida.
- Beneficio: menor logica acoplada en endpoints y flujo frontend mas simple.

## Estructura

```text
.
|-- docker-compose.yml
|-- .env.example
|-- scripts/
|   `-- setup.sh
|-- frontend/
|   |-- .env.example
|   |-- Dockerfile
|   `-- package.json
`-- nestjs-ecommerce/
    |-- .env.example
    |-- Dockerfile
    `-- package.json
```

## Requisitos

- Docker + Docker Compose
- Bash (Git Bash, WSL o Linux/macOS)

## Variables de entorno

### Raiz (`.env`)

```env
POSTGRES_USER=hassan
POSTGRES_PASSWORD=password
POSTGRES_DB=ecommercedb
POSTGRES_PORT=5432
```

### Backend (`nestjs-ecommerce/.env`)

```env
PORT=3000
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ecommercedb
DATABASE_USER=hassan
DATABASE_PASSWORD=password
DATABASE_URL=

JWT_SECRET=change-me-in-production
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=12345678
```

Nota: en Docker Compose, `DATABASE_HOST` se sobreescribe a `postgres` automaticamente.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api
```

## Deploy con script unico

Desde la raiz:

```bash
./scripts/setup.sh dev
./scripts/setup.sh prod
```

### Modo `dev`

- Levanta `postgres`, `backend-dev` y `frontend-dev` en Docker.
- Corre migraciones y seed antes de iniciar la app.
- Deja logs en foreground.

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

### Modo `prod`

- Build de imagenes `backend` y `frontend`.
- Levanta stack en segundo plano.
- Ejecuta migraciones en contenedor de backend.

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Logs en prod:

```bash
docker compose --profile prod logs -f
```

Apagar stack:

```bash
docker compose --profile dev down
# o
docker compose --profile prod down
```