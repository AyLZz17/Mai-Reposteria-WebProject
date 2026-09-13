# Requisitos No Funcionales

## Objetivo
Definir atributos de calidad y restricciones que deben cumplirse en la solución.

## Requisitos por prioridad

### Alta prioridad
- RNF-01: La comunicación entre frontend, backend y pagos debe ir cifrada con HTTPS/SSL.
- RNF-02: Los datos de tarjeta no se almacenan en la base de datos del sistema.
- RNF-03: Las páginas de administración solo pueden accederse por la administradora autenticada.
- RNF-04: El proceso de pago debe responder en condiciones normales en menos de 5 segundos.
- RNF-05: El inicio de sesión con Google debe ejecutar en menos de 3 segundos.
- RNF-06: La aplicación debe estar disponible la mayor parte del tiempo.
- RNF-07: La interfaz debe funcionar bien en móvil y computador, priorizando móvil.

### Media prioridad
- RNF-08: Se deben poder agregar o cambiar productos y categorías sin tocar el código.
- RNF-09: El sistema debe ser sencillo de usar, con procesos de compra cortos.
- RNF-10: El backend debe estar estructurado para facilitar futuras extensiones.
- RNF-11: El carrito, el domicilio y el total deben mostrarse con consistencia.

### Baja prioridad
- RNF-12: El sistema debe soportar crecimiento de usuarios sin caída significativa de desempeño.
- RNF-13: El código y la base de datos deben estar documentados.
- RNF-14: La solución debe ser portable y adaptable a distintos entornos de despliegue.

## Atributos de calidad
- Seguridad
- Rendimiento
- Disponibilidad
- Usabilidad
- Mantenibilidad
- Integridad
- Escalabilidad
- Portabilidad
