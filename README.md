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

## Guía de instalación en un computador nuevo

Esta guía prepara el entorno local desde cero. No es necesario instalar Java, Node.js, PostgreSQL, MongoDB ni Redis en el computador: Docker ejecuta cada componente en su propio contenedor.

### Requisitos

- Git.
- Docker Desktop actualizado, iniciado y configurado para usar contenedores Linux. Docker Desktop incluye Docker Compose v2.
- Conexión a internet durante la primera compilación, para descargar imágenes y dependencias.
- Puertos `80`, `443`, `5433` y `5434` disponibles. Los puertos `5433` y `5434` se usan para conectar herramientas locales a las bases de datos.

### 1. Descargar el proyecto

Abre PowerShell, Terminal o Git Bash y clona el repositorio:

```bash
git clone https://github.com/AyLZz17/Mai-Reposteria-WebProject.git
cd Mai-Reposteria-WebProject
```

### 2. Crear la configuración local

Crea el archivo `.env` a partir de la plantilla. Este archivo contiene secretos y no debe subirse a Git.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS, Linux o Git Bash:

```bash
cp .env.example .env
```

Abre `.env` y reemplaza `POSTGRES_PASSWORD` y `JWT_SECRET` por valores propios. `JWT_SECRET` debe tener al menos 32 bytes y mantenerse igual para todos los servicios; cambiarlo después invalida las sesiones existentes. Para generar uno aleatorio en PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

Para desarrollo local conserva `SITE_ADDRESS=localhost` y los orígenes CORS de ejemplo. En un despliegue público, configura `SITE_ADDRESS` con un dominio que apunte al servidor y `CORS_ALLOWED_ORIGINS` con el origen HTTPS exacto. Caddy necesita que los puertos `80` y `443` sean accesibles desde internet para emitir y renovar el certificado. `CONTACT_EMAIL` y `DELIVERY_FEE_COP` son opcionales; el costo de domicilio es `0` si no se configura.

### 3. Construir e iniciar la tienda

Desde la carpeta raíz del repositorio:

```bash
docker compose up -d --build
```

La primera ejecución puede tardar varios minutos. Comprueba que los contenedores estén iniciados y revisa los registros si alguno no arranca:

```bash
docker compose ps
docker compose logs -f
```

Abre **http://localhost** en el navegador. Si el navegador fuerza HTTPS para localhost, prueba **http://127.0.0.1**. Para una instalación pública, abre `https://<SITE_ADDRESS>` una vez que Caddy haya obtenido el certificado.

### 4. Detener o actualizar

Para detener los servicios sin borrar los datos:

```bash
docker compose down
```

Para volver a iniciar más adelante, ejecuta `docker compose up -d`. Para reconstruir después de descargar cambios del repositorio:

```bash
git pull
docker compose up -d --build
```

Los datos de cuentas, catálogo, carritos y estado de Caddy se conservan en volúmenes de Docker. **No uses `docker compose down -v` salvo que quieras borrar permanentemente esos datos.**

### Problemas frecuentes

- Si Docker indica que un puerto ya está ocupado, cierra la aplicación que lo utiliza o libera el puerto antes de iniciar el proyecto.
- Si el gateway no inicia, confirma que `JWT_SECRET` tenga 32 bytes o más y que `POSTGRES_PASSWORD` no esté vacío.
- Si el dominio público no carga por HTTPS, verifica que `SITE_ADDRESS` resuelva al servidor, que los puertos `80` y `443` estén abiertos y revisa `docker compose logs caddy`.
- Para ver los registros de un servicio específico, usa `docker compose logs -f <servicio>`, por ejemplo `docker compose logs -f catalog-service`.

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

## Pedidos por WhatsApp

El checkout del carrito registra cada pedido en MongoDB con un ticket `MAI-...`, el estado inicial `PENDING_CONFIRMATION`, los productos y una copia de sus precios validados contra el catalogo. La persona completa su nombre, telefono, modalidad de entrega, direccion cuando aplica e indicaciones; debe aceptar el uso de sus datos para gestionar el pedido. La vista publica `/pedido/<ticket>` muestra fotos, valores y estado, sin exponer nombre, telefono ni direccion.

El boton de WhatsApp prepara un mensaje con el ticket, los datos de entrega, productos, domicilio y total, ademas del enlace a las fotos. El usuario debe revisar y enviar el mensaje desde WhatsApp; crear el ticket no envia mensajes por si solo. La tarifa fija de domicilio se configura en el `.env` de la raiz con `DELIVERY_FEE_COP=5000` (ajusta el valor a la tarifa del negocio); Compose usa `0` si no se define. La recogida personalmente no agrega domicilio.

### Confirmacion y seguimiento del pedido

En **Admin > Pedidos**, busca el ticket para revisar el pedido y confirmar uno pendiente. Despues puedes cambiar manualmente su estado (pendiente, confirmado, en preparacion, listo, en camino, entregado o cancelado) y definir o corregir la fecha estimada. Los cambios quedan en la auditoria administrativa.

El cliente puede consultar el seguimiento en **/pedido** (enlace tambien disponible en el pie de pagina) o usar el enlace directo con su ticket. La vista publica muestra productos, valores, estado y fecha estimada; nunca expone los datos de contacto o direccion. La pagina consulta los cambios cada 30 segundos.

### Pedidos asociados a la cuenta

La ruta **/pedido** muestra automaticamente hasta los 50 pedidos mas recientes asociados a la cuenta autenticada. El cliente puede abrir cada ticket para ver su seguimiento; la lista se actualiza cada 30 segundos y solo consulta pedidos cuyo userId coincide con la sesion. La busqueda manual por ticket sigue disponible.

El menu superior de Home, Shop, About y Contact ofrece el enlace **Seguir pedido** hacia **/pedido**.

## Resenas de productos

Cada producto del catalogo muestra su promedio y cantidad de estrellas aprobadas. El cliente puede abrir el detalle y enviar una calificacion de 1 a 5 estrellas con titulo y comentario; debe iniciar sesion. Cada cuenta tiene una resena por producto y una edicion vuelve a dejarla pendiente de moderacion.

Las resenas nuevas quedan pendientes y no se publican ni afectan el promedio hasta que un administrador las apruebe. En **Admin > Resenas** se revisan por estado y se pueden aprobar o rechazar; las decisiones se registran en Auditoria. Los datos publicos no muestran la cuenta del autor. La tabla se crea de forma idempotente al iniciar Catalogo; su SQL aditivo esta en `Services/catalogo-service/database/postgresql/02_product_reviews.sql`.
