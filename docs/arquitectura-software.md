# Arquitectura de software — MAI Repostería

Diagrama lógico de la tienda según la implementación del proyecto. El archivo editable de diagrams.net está en [`arquitectura-software.drawio`](./arquitectura-software.drawio).

## Vista textual

```mermaid
flowchart LR
  subgraph Actores[Actores y navegador]
    Cliente[Cliente]
    Admin[Administrador / SUPER_ADMIN]
    Browser[Navegador web]
  end

  subgraph Entrada[Entrada pública]
    Caddy[Caddy\nProxy inverso · HTTP/HTTPS · ACME]
    Web[Frontend Next.js 16 / React 19\nTienda · carrito · pedidos · reseñas · Admin]
  end

  subgraph Plataforma[Red interna Docker Compose]
    Gateway[API Gateway\nSpring Cloud Gateway / WebFlux\n/api/v1 · JWT · CORS · rate limit · circuit breaker]

    Users[Users Service\nJava / Spring Boot\nLogin · registro · roles · auditoría]
    Catalog[Catalog Service\nNode.js / Express\nProductos · categorías · portada · reseñas]
    Cart[Cart Service\nNode.js / Express\nCarrito · creación y seguimiento de pedidos]

    UDB[(PostgreSQL\nUsers DB\nUsuarios · roles · refresh tokens · auditoría)]
    CDB[(PostgreSQL\nCatalog DB\nProductos · categorías · portada · reseñas)]
    MDB[(MongoDB\nCart DB\nCarritos · pedidos · snapshots de precio)]
    Redis[(Redis\nRate limiting del gateway\nCachés de catálogo y carrito)]
  end

  subgraph Externos[Servicios externos / del usuario]
    Google[Google OAuth tokeninfo]
    WhatsApp[WhatsApp Web / app\nEl usuario confirma el envío]
    Mail[Aplicación de correo\nmailto: confirmado por el usuario]
  end

  Cliente --> Browser
  Admin --> Browser
  Browser -->|páginas y recursos| Caddy
  Caddy -->|rutas web| Web
  Browser -->|/api/v1 · JSON · Bearer JWT| Caddy
  Caddy -->|/api/*| Gateway

  Gateway -->|/auth/** · /users/**| Users
  Gateway -->|/catalog/**| Catalog
  Gateway -->|/cart/** · reescritura a /api/cart/**| Cart

  Users <--> UDB
  Catalog <--> CDB
  Cart <--> MDB
  Gateway <--> Redis
  Catalog <--> Redis
  Cart <--> Redis

  Cart -->|GET producto para validar estado, stock y precio al crear pedido| Catalog
  Catalog -.->|POST /api/v1/internal/audit| Users
  Cart -.->|POST /api/v1/internal/audit\nconfirmación y cambios de seguimiento| Users

  Users <-->|Verifica ID token en login Google| Google
  Browser -.->|Abre enlace wa.me con mensaje preparado| WhatsApp
  Browser -.->|Abre enlace mailto| Mail

  classDef actor fill:#fff7e9,stroke:#9a6244,color:#3d2b22;
  classDef entry fill:#f6e9d9,stroke:#b8754f,color:#3d2b22;
  classDef api fill:#f0c7a9,stroke:#8e4c32,color:#3d2b22;
  classDef service fill:#ead7c7,stroke:#73503e,color:#2d211b;
  classDef data fill:#e2edf2,stroke:#547889,color:#20333b;
  classDef cache fill:#e4f0df,stroke:#69855f,color:#263322;
  classDef external fill:#f4e7ee,stroke:#9b647c,color:#3c2932;
  class Browser,Cliente,Admin actor;
  class Caddy,Web entry;
  class Gateway api;
  class Users,Catalog,Cart service;
  class UDB,CDB,MDB data;
  class Redis cache;
  class Google,WhatsApp,Mail external;
```

## Rutas representativas por servicio

| Servicio | Rutas y operaciones principales |
|---|---|
| Users Service | `POST /auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`; `POST /users/register`; `GET /users/me`; `PATCH` y `DELETE /users/admin-role`; `GET /users/audit`; `POST /internal/audit` |
| Catalog Service | `GET/PATCH /catalog/storefront`; CRUD de `/catalog/categories` y `/catalog/products`; `GET /catalog/reviews/summary`; `GET/POST /catalog/reviews/products/:productId`; `GET/PATCH /catalog/reviews/admin` |
| Cart Service | `GET /cart`; `POST /cart/items`; `PATCH/DELETE /cart/items/:productId`; `GET /cart/order-config`; `POST /cart/orders`; consulta `/orders/mine` y `/orders/:ticket/preview`; administración `/orders/:ticket/admin`, `/confirm` y `/tracking` |

## Recorridos importantes

### Catálogo

`Navegador → Caddy → Frontend → Caddy → API Gateway → Catalog Service → Redis (si hay caché) / PostgreSQL → respuesta al navegador`.

Las lecturas públicas de productos, categorías, portada y reseñas aprobadas no requieren iniciar sesión. Las escrituras administrativas requieren token de acceso y rol ADMIN o SUPER_ADMIN.

### Autenticación

`Frontend → Caddy → API Gateway → Users Service → PostgreSQL de usuarios → respuesta con tokens → Frontend`.

El frontend adjunta el access token como `Authorization: Bearer ...` a las solicitudes posteriores. Gateway valida los tokens de acceso en rutas protegidas; los servicios también validan token/rol para autorizar sus operaciones. En login Google, Users Service verifica el ID token con el endpoint `tokeninfo` de Google.

### Pedido

`Frontend → Gateway → Cart Service → MongoDB (carrito) → Catalog Service (validar cada producto) → PostgreSQL de catálogo → Cart Service → MongoDB (pedido y snapshot) → Frontend`.

El pedido queda con ticket `MAI-...`, precios copiados al momento de la compra y estado inicial `PENDING_CONFIRMATION`. Al completar el pedido se marca el carrito como ordenado y se invalida su caché. El navegador prepara el mensaje para WhatsApp; el cliente decide si lo envía. La ruta pública de seguimiento devuelve una proyección sin nombre, teléfono ni dirección.

### Administración y auditoría

El panel usa las mismas APIs. Catalog Service envía auditoría por cambios administrativos y moderación de reseñas; Cart Service la envía al confirmar pedidos y editar su seguimiento. Users Service guarda los eventos en PostgreSQL. La consulta de auditoría está restringida a SUPER_ADMIN.

## Notas para interpretar el diseño

- Caddy enruta `/api/*` al gateway y las demás rutas al frontend.
- El gateway enruta por prefijo y, para el carrito, reescribe `/api/v1/cart/...` a `/api/cart/...`.
- Las bases de datos tienen un servicio propietario cada una; el frontend no accede directamente a ellas.
- Redis apoya el rate limiting del gateway y las cachés. Catálogo y carrito contemplan seguir trabajando con su almacén principal si Redis no está disponible.
- El proyecto valida precio, estado activo y stock consultando catálogo al crear el pedido; en ese flujo no se observa una operación que descuente inventario.
- Contacto usa `mailto:` y WhatsApp mediante enlaces abiertos desde el navegador; no se representa un servidor de correo o envío automático de WhatsApp porque no están implementados como servicios backend.
- Logs técnicos y métricas son observabilidad transversal de los servicios; las acciones administrativas persistidas son la auditoría de Users Service.
