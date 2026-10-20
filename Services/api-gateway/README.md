# MAI Repostería API Gateway

Gateway reactiva basada en Spring Cloud Gateway WebFlux.

## Ejecución local

Requiere Java 21, Redis disponible y los microservicios levantados. Configura las variables de `.env.example` en el entorno y ejecuta:

```powershell
.\mvnw.cmd spring-boot:run
```

La Gateway queda disponible en `http://localhost:8080`.

## Rutas

- `/api/v1/auth/**`, `/api/v1/users/**` → users-service
- `/api/v1/catalog/**` → catalog-service
- `/api/v1/cart/**` → cart-service

`JWT_ISSUER_URI` activa la validación JWT. Si está vacío, la aplicación permite las peticiones para desarrollo local; no debe dejarse vacío en producción.

Redis se utiliza para el rate limiting. La protección contra intentos fallidos de inicio de sesión pertenece a users-service; la Gateway añade el límite perimetral por IP.
