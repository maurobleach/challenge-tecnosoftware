# README_FIXES

## Errores encontrados
- Fallo al levantar app/seed/migraciones por conexion a PostgreSQL (`password authentication failed for user "hassan"`).
- `AuthGuard` rompia en runtime cuando faltaba `Authorization` o venia con formato invalido.
- Relacion TypeORM en `User` mal tipada (`OneToMany` declarado como objeto en lugar de array).
- `migration:revert` tenia script inconsistente (faltaba `--` para pasar argumentos al script `typeorm`).
- `docker-compose.yml` con configuracion minima pero fragil para arranque local (sin `POSTGRES_DB`, sin `healthcheck`, volumen bind local propenso a estado inconsistente).

## Que se corrigio
- `src/api/auth/guards/auth.guard.ts`
  - Validacion defensiva del header `Authorization`.
  - Validacion de esquema `Bearer <token>` antes de verificar JWT.
- `src/database/entities/user.entity.ts`
  - `products` corregido de `Product` a `Product[]`.
- `docker-compose.yml`
  - Se definio `POSTGRES_DB=ecommercedb`.
  - Se agrego `healthcheck` con `pg_isready`.
  - Se cambio a volumen nombrado `postgres-data` para un estado mas estable.
  - Se fijo imagen `postgres:15` y `restart: unless-stopped`.
- `init.sql`
  - Se elimino creacion duplicada de `ecommercedb` (ahora la crea `POSTGRES_DB`).
  - Se mantiene creacion de `ecommercetestdb` para tests/uso local.
- `package.json`
  - `migration:revert` corregido a `npm run typeorm -- migration:revert`.

## Que decidi NO tocar
- No se hizo refactor de arquitectura, modulos ni servicios.
- No se rediseno auth/JWT, solo robustez minima en guard.
- No se cambiaron DTOs ni validaciones de dominio que no bloquean el arranque.
- No se alteraron migraciones historicas.

## Pasos exactos para levantar local
1. Instalar dependencias:
   - `npm install`
2. Reiniciar PostgreSQL local del proyecto (importante para evitar credenciales/estado viejo):
   - `docker compose down -v`
   - `docker compose up -d`
3. Compilar:
   - `npm run build`
4. Ejecutar migraciones:
   - `npm run migration:run`
5. Ejecutar seeders:
   - `npm run seed:run`
6. Iniciar backend:
   - `npm run start:dev`

## Pendientes no criticos
- Si ya existia un contenedor/volumen previo con otras credenciales, siempre hay que recrearlo con `docker compose down -v`.
- En algunos entornos PowerShell, `npm.ps1` puede estar bloqueado por ExecutionPolicy. Alternativa: usar `npm.cmd`.
