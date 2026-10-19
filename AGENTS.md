# AGENTS.md — Instrucciones del proyecto MAI Repostería

> **Léelo completo antes de cualquier tarea.** Este archivo es la fuente de verdad de las reglas del proyecto.
> **Se actualiza al terminar CADA tarea**. Si algo aquí contradice a `MEMORY.md`, gana `AGENTS.md`.

Archivos de gobierno: `AGENTS.md` (reglas permanentes) · `SKILLS.md` (habilidades y recetas) · `MEMORY.md` (memoria corta, máx. 50 líneas).

---

## 1. Contexto del proyecto

- **Nombre de trabajo:** MAI REPOSTERIA
- **Qué es:** Aplicación web comercial para compra y gestión de repostería artesanal.
- **Tipo de producto:** Aplicación web tienda virtual y plataforma de gestión.
- **Documentación fuente:** `wiki/` y `Services/users-service/database/postgresql/01_schema.sql`.

---

## 2. Decisiones de Arquitectura y Stack Backend

- **Java & Framework:** Java 21 LTS (Amazon Corretto), Spring Boot 4.1.x.
- **Microservicio Identity/Users:** `Services/users-service` (puerto 8081).
- **Base de datos:** PostgreSQL (`mai_users_service`), migraciones con Flyway baseline.
- **Estructura por capas:**
  - `domain.entity`: `User`, `Role`, `RefreshToken` (UUID, OffsetDateTime UTC).
  - `domain.repository`: `UserRepository`, `RoleRepository`, `RefreshTokenRepository`.
  - `domain.service`: `UserService`, `AuthService`.
  - `api.dto`: records inmutables (`LoginRequest`, `AuthResponse`, `RefreshTokenRequest`, `GoogleLoginRequest`, `RegisterUserRequest`, `UserResponse`).
  - `api.controller`: `AuthController` (`/api/v1/auth`), `UserController` (`/api/v1/users`).
  - `api.exception`: `GlobalExceptionHandler` centralizado.
  - `infrastructure.config`: `SecurityConfig` (stateless, BCrypt, filtro JWT).
  - `infrastructure.security`: `JwtService` (JJWT HMAC-SHA256), `JwtAuthenticationFilter`, `GoogleAuthService` (Google OAuth 2.0).
- **Mecanismo de Autenticación:**
  - JWT Access Token (15 min) + Refresh Token (7 días) con rotación y almacenamiento de hash SHA-256 en BD.
  - Login con Google mediante validación de Google ID Token (auto-registro con rol `CLIENTE`).
- **API Gateway:** Se desarrollará en un repositorio independiente antes del merge final del backend.
