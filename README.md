# Challenge TecnoSoftware

Configuracion fullstack simple para ejecutar frontend React/Vite y backend NestJS con PostgreSQL.

## Stack

- Frontend: React + Vite + React Router
- Backend: NestJS + TypeORM
- Base de datos: PostgreSQL 15
- Local DB: Docker Compose
- Deploy sugerido: Railway

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
- Se priorizo simplicidad operativa con deploy local por script unico y opcion Railway.

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
|   |-- package.json
|   `-- railway.json
`-- nestjs-ecommerce/
    |-- .env.example
    |-- package.json
    `-- railway.json
```

## Requisitos locales

- Node.js 20+
- npm 10+
- Docker + Docker Compose
- Bash (Git Bash, WSL o Linux/macOS)

## Variables de entorno

### Raiz (`.env`)

Se usa para levantar PostgreSQL local con Docker:

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

Nota: `DATABASE_URL` es opcional en local, pero recomendado para Railway.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api
```

## Script unico

Desde la raiz:

```bash
./scripts/setup.sh dev
./scripts/setup.sh prod
```

### Que hace

1. Instala dependencias de frontend y backend.
2. Levanta PostgreSQL con Docker.
3. Espera disponibilidad de DB.
4. Ejecuta migraciones.
5. En `dev`, ejecuta seed.
6. Inicia backend y frontend.

## Opciones de deploy sugeridas

Este proyecto se puede desplegar de dos formas simples:

1. Con `./scripts/setup.sh` para entorno local o servidor simple con Docker.
2. Con Railway para un deploy gestionado.

## Deploy en Railway (opcional)

Se agregaron:

- `nestjs-ecommerce/railway.json`
- `frontend/railway.json`

Con esto, Railway toma build/start/pre-deploy desde el repo.

### 1. Crear proyecto y servicios

En Railway:

1. Crea un proyecto nuevo.
2. Agrega servicio `PostgreSQL` desde `+ New`.
3. Agrega servicio `backend` desde tu repo GitHub.
4. Agrega servicio `frontend` desde tu repo GitHub.

### 2. Configurar monorepo

Configura `Root Directory`:

- Servicio backend: `nestjs-ecommerce`
- Servicio frontend: `frontend`

Y en cada servicio define `Config File Path` (ruta absoluta desde la raiz del repo):

- Backend: `/nestjs-ecommerce/railway.json`
- Frontend: `/frontend/railway.json`

### 3. Variables del backend

En el servicio backend define:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<tu-secret>
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=<tu-password>
FRONTEND_URL=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
BASE_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

### 4. Variables del frontend

En el servicio frontend define:

```env
VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

### 5. Deploy

- Haz push a `main`.
- Railway va a desplegar ambos servicios.
- El backend ejecuta migraciones automaticamente en `preDeployCommand`.

### 6. URLs finales

- Frontend: dominio publico del servicio frontend.
- Backend API: dominio publico del servicio backend.
