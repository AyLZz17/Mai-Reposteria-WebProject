# MEMORY.md -- Memoria de corto plazo (max. 50 lineas)
> Se reescribe tras cada tarea. Lo critico y permanente se promueve a AGENTS.md.

- La portada del frontend consume `/catalog/storefront` y usa sus productos destacados.
- El panel `/admin` permite editar configuración de portada y campos visuales de productos.
- Verificación realizada: `FrontEnd/npm run build` pasa correctamente.
- El panel de productos incluye borrado permanente con confirmación.
- `SUPER_ADMIN` dispone de la sección Administradores para promover usuarios por correo; el backend valida el rol.
- Los administradores normales no ven la sección de gestión de administradores.
- Un `SUPER_ADMIN` puede asignar y quitar el rol `ADMIN` por correo.

