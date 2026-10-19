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
- **Base de datos:** PostgreSQL (`mai_users_service`), migraciones gestionadas con Flyway en modo baseline.
- **Estructura por capas:**
  - `domain.entity`: Entidades JPA alineadas al esquema SQL (UUID como ID, OffsetDateTime con zona horaria UTC).
  - `domain.repository`: Interfaces `JpaRepository`.
  - `domain.service`: Servicios transaccionales y lógica de negocio.
  - `api.dto`: `record` inmutables con validación Jakarta (no exponer entidades en la API).
  - `api.controller`: Controladores `@RestController` con prefijo `/api/v1/...`.
  - `api.exception`: Manejador centralizado `@RestControllerAdvice` con respuestas JSON estructuradas.
  - `infrastructure.config`: Configuraciones de Spring (Security stateless, Beans de PasswordEncoder BCrypt).
- **API Gateway:** Se desarrollará en un repositorio independiente antes del merge final del backend.
