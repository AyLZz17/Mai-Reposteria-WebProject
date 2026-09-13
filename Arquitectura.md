# Arquitectura

## Visión general
La plataforma está diseñada como una solución web para repostería con una experiencia centrada en el cliente y un panel administrativo para la emprendedora.

## Principios arquitectónicos
- Separación por dominios funcionales
- Comunicación entre servicios mediante APIs y eventos ligeros
- Frontend centrado en la experiencia de compra
- Seguridad con autenticación OAuth y validación con JWT
- Escalabilidad gradual para futuros módulos

## Microservicios propuestos

### 1. Servicio de autenticación y usuarios
Responsable de:
- inicio de sesión con Google
- registro y perfil de usuario
- gestión básica de clientes y administradora

### 2. Servicio de catálogo y recomendaciones
Responsable de:
- productos del menú
- categorías
- producto destacado
- recomendaciones por historial

### 3. Servicio de pedidos
Responsable de:
- carrito
- items del carrito
- pedidos
- detalles de pedido
- estados de pedido

### 4. Servicio de pagos
Responsable de:
- procesamiento de pagos
- métodos de pago
- estados del pago

### 5. Servicio de reseñas
Responsable de:
- reseñas de pedidos
- reseñas generales
- promedio de calificación

## Stack tecnológico sugerido
- Frontend: Next.js
- Backend: FastAPI y Spring Boot
- Base de datos: PostgreSQL + MongoDB, o MongoDB único
- Autenticación: Google OAuth 2.0 + JWT
- Infraestructura: despliegue modular y adaptable a nube

## Consideraciones clave
- Se prioriza la experiencia móvil
- Los pagos no deben almacenar datos sensibles en la base de datos propia
- La administradora debe poder actualizar catálogo y pedidos sin depender de desarrollo continuo

## Diagramas relacionados
- [Diagrama de clases](../Documentación/diagrama_clases.drawio)
- [Diagrama ER](../Documentación/diagrama_ER.drawio)
- [Diagrama de secuencia](../Documentación/diagrama_secuencia.drawio)
