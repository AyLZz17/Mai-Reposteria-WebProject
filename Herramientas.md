# 🍰 Repostería Web App — Stack Tecnológico

Documentación de herramientas y tecnologías seleccionadas para el desarrollo de la plataforma web de repostería (tortas y galletas) de Ibagué. Arquitectura basada en **microservicios**, con backend políglota (Python + Java) y frontend en React/Next.js.

---

## 🖥️ Backend

| Servicio | Tecnología | Por qué |
|---|---|---|
| **Servicios simples/básicos** (menú, carrito, tendencia, reseñas) | **Python + FastAPI** | Asíncrono por defecto (bueno para APIs con muchas peticiones concurrentes tipo menú/carrito), genera documentación automática (Swagger/OpenAPI) y tiene curva de aprendizaje baja, ideal para servicios pequeños y desacoplados. |
| **Recomendación de productos** | **Python** (FastAPI + `pandas` / `scikit-learn`) | Python domina el ecosistema de datos/ML, así que si el algoritmo de recomendación evoluciona a algo más inteligente, el ecosistema ya está listo. |
| **Pagos** (Google Pay, PSE, tarjeta) | **Java + Spring Boot** | Spring Security es uno de los frameworks más maduros y auditados para manejo de transacciones, tokens y cifrado. Las pasarelas de pago en Colombia (Wompi, PayU, Mercado Pago) tienen buen soporte en Java. |
| **Chat** | **Java + Spring Boot** (Spring WebSocket / STOMP) | Soporte robusto y probado para WebSockets, necesario para chat en tiempo real cliente-negocio. |
| **Gestión de datos de usuario** (perfil, historial sensible) | **Java + Spring Boot + Spring Security** | Control fino sobre autenticación, roles y cifrado de datos, más estricto que en microservicios "simples". |

---

## 🗄️ Base de Datos

### Híbrido PostgreSQL + MongoDB

| Necesidad | Tecnología | Por qué |
|---|---|---|
| Usuarios, pedidos, pagos, reseñas | **PostgreSQL** | Relacional con soporte **ACID** real — crítico porque un pago y su pedido no pueden quedar en estados inconsistentes (ej. que se cobre pero no se registre el pedido). Maneja bien relaciones (usuario → pedidos → productos → reseñas). |
| Menú de productos, catálogo, historial de navegación, chat | **MongoDB** | Estructura flexible (documentos), ideal para datos que cambian de forma (ej. un producto con atributos variables: tamaño, sabor, decoración) y para lecturas rápidas de catálogo sin necesidad de joins. |

---

## 🔐 Autenticación

| Necesidad | Tecnología | Por qué |
|---|---|---|
| Login con Google | **OAuth 2.0 / OpenID Connect** (Google Identity Services) | Estándar oficial de Google; el frontend obtiene un token de Google y cada microservicio lo valida con librerías oficiales (`google-auth` en Python, `spring-security-oauth2` en Java). |
| Sesión entre microservicios | **JWT** propio, emitido tras validar el login de Google | Permite que cualquier microservicio (Python o Java) valide la identidad del usuario sin depender de una sesión centralizada. |

---

## 🔗 Comunicación entre Microservicios

| Necesidad | Tecnología | Por qué |
|---|---|---|
| Comunicación API-a-API | **REST (JSON sobre HTTP)** | Estándar simple de implementar y documentar entre Python (FastAPI) y Java (Spring Boot). |
| Enrutamiento hacia el servicio correcto | **API Gateway** (NGINX o Spring Cloud Gateway) | Punto único de entrada; el frontend no necesita saber a qué microservicio le está hablando. |
| Eventos asíncronos (opcional) | **RabbitMQ** | Desacopla servicios (ej. notificar "pedido pagado" sin que el servicio de pagos conozca a los suscriptores). Opcional para no sobrecomplicar el alcance académico. |

---

## 🎨 Frontend

| Necesidad | Tecnología | Por qué |
|---|---|---|
| Framework principal | **Next.js (React) + TypeScript** | SSR/SSG para buen SEO local (ej. "torta cumpleaños Ibagué"), gran ecosistema de librerías, y TypeScript da contratos de datos claros con los microservicios. |
| Autenticación en frontend | **NextAuth.js** | Proveedor de Google integrado; se conecta de forma natural con el flujo de JWT del backend. |
| Estilos | **Tailwind CSS** | Rápido de aplicar y con apariencia profesional sin escribir CSS desde cero. |
| Estado del carrito | **Zustand** | Estado global simple y accesible desde cualquier página. |
| Peticiones a la API + caché | **TanStack Query (React Query)** | Maneja loading/error states y cachea respuestas (ej. menú) automáticamente. |
| Formularios | **React Hook Form + Zod** | Validación robusta y tipada (checkout, dirección, personalización de pedido). |
| Componentes UI | **shadcn/ui** | Componentes accesibles y personalizables con Tailwind, ahorra tiempo de diseño visual. |
| Chat en tiempo real | `@stomp/stompjs` + `sockjs-client` | Conexión directa a WebSockets de Spring Boot para el chat cliente-negocio. |

---

## 🏗️ Infraestructura

| Necesidad | Tecnología | Por qué |
|---|---|---|
| Contenerización | **Docker + docker-compose** | Levanta todos los microservicios y bases de datos con un solo comando. |
| Control de versiones | **Git + GitHub** | Estándar de la industria; sirve como evidencia de progreso del proyecto académico. |

---

