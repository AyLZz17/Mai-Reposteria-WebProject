# MEMORY.md -- Memoria de corto plazo (max. 50 lineas)
> Se reescribe tras cada tarea. Lo critico y permanente se promueve a AGENTS.md.

## Estado final: Rama `Backend/services/users-service` ✅
- **Microservicio:** `users-service` (Java 21, Spring Boot 4.1.1, PostgreSQL, JPA/Hibernate, Flyway, Spring Security, JJWT).
- **Módulo Identity & Auth:** 100% completado y verificado.
  - Entidades: `User` (roles ManyToMany), `Role` (CLIENTE, ADMIN, SUPER_ADMIN), `RefreshToken` (hash SHA-256).
  - Seguridad: `SecurityConfig` stateless, BCrypt, `JwtAuthenticationFilter` (Bearer token con claims de usuario y roles).
  - JWT: `JwtService` con HMAC-SHA256 (Access Token 15 min, Refresh Token 7 días con rotación).
  - OAuth 2.0: `GoogleAuthService` (validación de Google ID Token y auto-registro con rol CLIENTE).
  - Endpoints REST:
    - `/api/v1/auth/login`: autenticación email/password.
    - `/api/v1/auth/google`: login/registro con Google.
    - `/api/v1/auth/refresh`: renovación de tokens con rotación.
    - `/api/v1/auth/logout`: revocación de tokens en BD.
    - `/api/v1/users/register`: registro con hash BCrypt y asignación de rol.
    - `/api/v1/users/{id}`, `/api/v1/users/email/{email}`, `/api/v1/users/check-email`, `/api/v1/users/{id}/status`.
- **Validación:** `AuthFlowIntegrationTest` ejecutado con éxito contra PostgreSQL local (pruebas de registro, login, persistencia en BD y emisión de JWT verificadas).

## Siguiente paso
- Transición a la siguiente rama de backend (nuevo microservicio según el backlog de arquitectura).
