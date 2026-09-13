# Wiki del Proyecto – Plataforma Web para Repostería

## Introducción
Este proyecto busca digitalizar la operación de una repostería en Ibagué para mejorar la venta, organizar los pedidos y facilitar la atención tanto para clientes como para la administradora.

## Objetivo general
Desarrollar una plataforma web para vender productos de repostería, gestionar pedidos, permitir pagos y mantener una experiencia profesional para los clientes.

## Usuarios principales
- Clientes
- Administradora

## Funcionalidades principales
- Catálogo de productos
- Carrito de compras
- Personalización de pedidos
- Domicilio o recogida
- Pagos digitales
- Historial de compras
- Reseñas
- Administración del menú y pedidos

## Arquitectura propuesta
La solución está pensada con una arquitectura basada en microservicios, con separación por dominios:

- Servicio de autenticación y usuarios
- Servicio de catálogo y recomendaciones
- Servicio de pedidos
- Servicio de pagos
- Servicio de reseñas

## Stack tecnológico sugerido
- Frontend: Next.js
- Backend: FastAPI y Spring Boot
- Base de datos: PostgreSQL + MongoDB o MongoDB único
- Autenticación: Google OAuth 2.0 + JWT
- Comunicación entre servicios: APIs REST y WebSockets

## Documentación disponible
- [Avance 1 del proyecto](../Documentación/avance1_proyecto_reposteria.md)
- [Tecnologías del proyecto](../Documentación/Tecnologias_para_proyecto.md)

## Diagramas
- [Diagrama de clases](../Documentación/diagrama_clases.drawio)
- [Diagrama ER](../Documentación/diagrama_ER.drawio)
- [Diagrama de secuencia](../Documentación/diagrama_secuencia.drawio)
- [User flow cliente](../Documentación/01_user_flow_cliente.drawio)
- [User flow administradora](../Documentación/02_user_flow_administradora.drawio)

## Historias de usuario
Se consideran historias desde la perspectiva del cliente y de la administradora, incluyendo:
- ver menú
- iniciar sesión con Google
- agregar productos al carrito
- personalizar pedidos
- pagar con diferentes métodos
- dejar reseñas
- administrar el catálogo y pedidos

## Requisitos no funcionales
Los requerimientos no funcionales priorizan seguridad, rendimiento, disponibilidad, usabilidad y mantenibilidad.

## Validación con stakeholders
La documentación ya incluye una sección de validación con stakeholders, donde se confirmaron los principales requerimientos del negocio y el diseño general de la solución.

## Conclusión
Este repositorio ya está listo para servir como base de una Wiki en GitHub y para la presentación final del proyecto.
