# MAI Repostería

Tienda web de repostería organizada como frontend Next.js, gateway API y microservicios de usuarios, catálogo y carrito. Usa PostgreSQL para usuarios y catálogo, MongoDB para carritos y Redis para caché.

## Desarrollo y pruebas con Docker

Requisitos: Docker Desktop con Compose y un `.env` local (no se versiona) con `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `SITE_ADDRESS` y `CORS_ALLOWED_ORIGINS`. Define `SITE_ADDRESS` como el dominio público configurado para Caddy; Caddy solicita certificados HTTPS mediante ACME, por lo que `localhost` no es adecuado para ese flujo.

Desde la raíz del proyecto:

```powershell
docker compose up -d --build
docker compose ps
docker compose logs -f
```

En desarrollo local, abre **http://localhost** (puerto `80`, sin HTTPS); Caddy enruta la web y `/api` al gateway. Si el navegador fuerza HTTPS para `localhost`, prueba **http://127.0.0.1**. Para el dominio configurado, abre `https://<SITE_ADDRESS>`. Para apagar los servicios, usa `docker compose down` (conserva los datos). Para eliminar los datos también, hace falta borrar los volúmenes; no lo hagas si necesitas conservar las bases.

| Servicio | Puerto del equipo | Base de datos |
|---|---:|---|
| PostgreSQL usuarios | `5433` | `mai_users_service` |
| PostgreSQL catálogo | `5434` | `mai_catalog_service` |
| Web y API | `80` / `443` | Caddy |

MongoDB y Redis solo son accesibles dentro de la red de Docker.

## Cuenta SUPER_ADMIN de pruebas

- **Correo:** `superadmin.test@mai-reposteria.invalid`
- **Rol:** `SUPER_ADMIN`
- **Contraseña:** se entregó por separado; no se guarda en este README ni en Git.

Es una cuenta de prueba local. El dominio `.invalid` no puede recibir correos y la cuenta tiene el correo sin verificar. No reutilices esta contraseña en producción.

### Crear otra cuenta SUPER_ADMIN

Con los servicios iniciados, abre `psql` dentro del contenedor de usuarios:

```powershell
docker compose exec -it users-db psql -U postgres -d mai_users_service
```

En el prompt de `psql`, pega esta consulta. Genera una contraseña aleatoria de 48 caracteres, almacena su hash BCrypt y asigna el rol; la contraseña aparece una sola vez en el resultado:

```sql
WITH credentials AS (
    SELECT
        'superadmin.nuevo@mai-reposteria.invalid'::text AS email,
        encode(gen_random_bytes(24), 'hex') AS password
),
created AS (
    INSERT INTO users (email, password_hash, first_name, last_name, is_active, is_email_verified)
    SELECT email, crypt(password, gen_salt('bf')), 'Superadmin', 'Prueba', TRUE, FALSE
    FROM credentials
    ON CONFLICT (email) DO NOTHING
    RETURNING id
),
assigned AS (
    INSERT INTO user_roles (user_id, role_id)
    SELECT created.id, roles.id
    FROM created
    JOIN roles ON roles.name = 'SUPER_ADMIN'
    ON CONFLICT (user_id, role_id) DO NOTHING
    RETURNING user_id
)
SELECT credentials.email, credentials.password, roles.name AS role
FROM credentials
CROSS JOIN created
JOIN assigned ON assigned.user_id = created.id
JOIN user_roles ON user_roles.user_id = assigned.user_id
JOIN roles ON roles.id = user_roles.role_id AND roles.name = 'SUPER_ADMIN';
```

Copia y guarda la contraseña mostrada en un gestor seguro: no se puede recuperar desde el hash. Para crear otra cuenta, cambia el correo por uno nuevo antes de ejecutar la consulta. Si el correo ya existe, no se modifica la cuenta y no se genera una contraseña. Sal de `psql` con `\q`.

## Pruebas por componente

Ejecuta cada comando desde la carpeta indicada. Instala dependencias primero con `npm ci` donde corresponda.

```powershell
# Usuarios (Java 21)
cd Services/users-service
.\mvnw.cmd test

# Catálogo
cd ..\catalogo-service
npm ci
npm test

# Carrito
cd ..\cart-service
npm ci
npm test

# Frontend
cd ..\..\FrontEnd
npm ci
npm run lint
```

`npm run test:integration` del catálogo requiere PostgreSQL disponible y configurado para pruebas.
