# MEMORY.md -- Memoria de corto plazo (max. 50 lineas)
> Se reescribe tras cada tarea. Lo critico y permanente se promueve a AGENTS.md.

## Estado actual: Rama `Backend/services/users-service`
- **Microservicio:** `users-service` (Java 21, Spring Boot 4.1.1, PostgreSQL, JPA, Flyway, Spring Security).
- **Entidad `User`:** Mapeada a la tabla `users` (UUID, email, passwordHash, firstName, lastName, active, emailVerified, createdAt, updatedAt).
- **Persistencia:** `UserRepository` (`JpaRepository<User, UUID>`) con consultas por email.
- **Lógica de negocio:** `UserService` con inyección de `PasswordEncoder` (BCrypt), registro con hash de contraseña, validación de email duplicado y activación/desactivación.
- **Capa API/DTO:** 
  - `RegisterUserRequest` (record con validaciones Jakarta: email, password >= 8 car., nombres).
  - `UserResponse` (record de respuesta seguro con OffsetDateTime y sin passwordHash).
  - `UserController` en `/api/v1/users` (endpoints: POST /register, GET /{id}, GET /email/{email}, GET /check-email, PATCH /{id}/status).
  - `GlobalExceptionHandler` (manejo de validaciones 400, conflicto 409 y 500).
- **Seguridad:** `SecurityConfig` configurado en modo stateless, CSRF deshabilitado y rutas públicas `/api/v1/users/**` y `/actuator/**`.
- **Compilación:** `BUILD SUCCESS` verificado (9 archivos fuente compilados sin errores).

## Siguiente paso
- Validación integral de tests con la base de datos PostgreSQL local corriendo.
- Transición hacia la siguiente rama / feature del sprint (autenticación JWT / OAuth 2.0 / roles).
