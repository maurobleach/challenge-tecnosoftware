# Challenge TecnoSoftware

#Problemas iniciales detectados
- Problemas de seguridad en la gestión de autenticación.
- Configuración incorrecta de variables de entorno, impidiendo la conexión a la base de datos.
- Errores de tipado en entidades como User y Category.
- Uso incorrecto de decoradores en la entidad Product.
- Lógica de la entidad Inventory inexistente o incompleta.
- Errores en la migración: nombres de columnas mal definidos en Inventory.
- Existencia de entidades sin un dominio claro o sin integración en el flujo de negocio.

#Implementación de eventos

Se incorporó un enfoque event-driven interno mediante eventos de dominio:

- product.created: Crea automáticamente un registro de inventario al generarse un nuevo producto.
- Permite desacoplar la creación del producto de la gestión de stock.
- product.activated: Se dispara cuando el producto cuenta con la información mínima requerida (title, description, etc.).
- Reduce la lógica en endpoints y simplifica la interacción desde el frontend.

#Decisiones técnicas
- Se mantuvo un monolito modular para reducir la complejidad asociada a microservicios.
- Se implementó un enfoque event-driven interno utilizando eventos de dominio.
- Se creó un endpoint para obtener categorías precargadas mediante migración.
- Se desarrolló la lógica del módulo Inventory.
- Se desacopló el módulo de productos del módulo de inventario mediante eventos.
- El frontend fue diseñado de forma simple y clara, alineado con las capacidades del backend.


Configuracion fullstack simple para ejecutar un frontend React/Vite y un backend NestJS con PostgreSQL en Docker.

## Stack

- Frontend: React + Vite + React Router
- Backend: NestJS + TypeORM
- Base de datos: PostgreSQL 15 (Docker Compose)

## Estructura

```text
.
|-- docker-compose.yml
|-- .env.example
|-- scripts/
|   `-- setup.sh
|-- frontend/
|   |-- .env.example
|   `-- package.json
`-- nestjs-ecommerce/
    |-- .env.example
    `-- package.json
```

## Requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose
- Bash (Git Bash, WSL o Linux/macOS)

## Variables de entorno

### Raiz (`.env`)

Se usa para Docker Compose:

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
JWT_SECRET=change-me-in-production
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=12345678
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api
```

> Si faltan archivos `.env`, el script los crea automaticamente desde los `.env.example`.

## Uso rapido (script unico)

Desde la raiz:

```bash
./scripts/setup.sh dev
```

o

```bash
./scripts/setup.sh prod
```

### Que hace el script

1. Instala dependencias de backend y frontend (`npm ci`).
2. Levanta PostgreSQL con Docker Compose.
3. Espera hasta que la DB este disponible.
4. Ejecuta migraciones del backend.
5. En `dev`, ejecuta seeders.
6. Inicia backend y frontend.

## Ejecucion manual (opcional)

### Desarrollo

```bash
docker compose up -d postgres
cd nestjs-ecommerce && npm ci && npm run migration:run && npm run seed:run && npm run start:dev
cd frontend && npm ci && npm run dev
```

### Produccion simple

```bash
docker compose up -d postgres
cd nestjs-ecommerce && npm ci && npm run migration:run && npm run build && npm run start:prod
cd frontend && npm ci && VITE_API_URL=http://localhost:3000 npm run build && PORT=5173 npm run start
```

## Docker

Solo se dockeriza PostgreSQL para mantener el deploy simple.

- Archivo principal: `docker-compose.yml` en la raiz.
- Servicio: `postgres`.
- Volumen persistente: `postgres-data`.

## Subir a GitHub (basico)

```bash
git init
git add .
git commit -m "chore: setup fullstack run flow"
git branch -M main
git remote add origin <URL_DEL_REPO>
git push -u origin main
```

Si `frontend/` o `nestjs-ecommerce/` contienen su propio `.git`, removelos antes de `git add .` para evitar repositorios embebidos:

```bash
rm -rf frontend/.git nestjs-ecommerce/.git
```