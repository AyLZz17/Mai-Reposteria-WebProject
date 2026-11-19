# AGENTS.md — Instrucciones del proyecto XMR-Forecast

> **Léelo completo antes de cualquier tarea.** Este archivo es la fuente de verdad de las reglas del proyecto.
> **Se actualiza al terminar CADA tarea** (ver §7 y §10). Si algo aquí contradice a `MEMORY.md`, gana `AGENTS.md`.

Archivos de gobierno: `AGENTS.md` (reglas permanentes) · `SKILLS.md` (habilidades y recetas) · `MEMORY.md` (memoria corta, máx. 50 líneas).

---

## 1. Contexto del proyecto

- **Nombre de trabajo:** MAI REPOSTERIA
- **Qué es:** aplicación web comercial que permite comprar productos de reposteria 
- **Tipo de producto:** aplicacion web tienda virtual reposteria
- **Documentos fuente ../wiki
- **Documentación derivada:** ../wiki

## 2. Criterios de experiencia de usuario

- Priorizar la navegación y lectura en móvil, manteniendo la identidad visual cálida ya validada (tonos crema, cacao y terracota).
- Mantener la portada enfocada en descubrir el catálogo y llegar a la tienda con pocos pasos.
- Usar estructura semántica, controles identificables y estados de foco visibles para facilitar teclado y tecnologías de asistencia.
- El contenido público editable por administración debe persistir en backend y renderizarse como texto plano con límites de longitud.
- No exponer credenciales de proveedores en el frontend. Si el correo se envía desde el servidor, validar datos y limitar solicitudes públicas; el uso de `mailto:` requiere explicar que el usuario final confirma el envío en su aplicación.

