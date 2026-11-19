# MEMORY.md -- Memoria de corto plazo (max. 50 lineas)
> Se reescribe tras cada tarea. Lo critico y permanente se promueve a AGENTS.md.

- La portada del frontend consume `/catalog/storefront` y usa sus productos destacados.
- El panel `/admin` permite editar configuración de portada y campos visuales de productos.
- Verificación realizada: `FrontEnd/npm run build` pasa correctamente.
- El panel de productos incluye borrado permanente con confirmación.
- `SUPER_ADMIN` dispone de la sección Administradores para promover usuarios por correo; el backend valida el rol.
- Los administradores normales no ven la sección de gestión de administradores.
- Un `SUPER_ADMIN` puede asignar y quitar el rol `ADMIN` por correo.
- La portada prioriza móvil, conserva la paleta crema/cacao/terracota y presenta acceso directo al catálogo.
- UX/UI 26.1: se mejoraron jerarquía visual de portada, tarjetas adaptables y foco visible de navegación; los puntos 4 a 9 siguen pendientes por indicación del usuario.
- About ahora usa `storefront_settings.about_text`; se edita desde Portada en `/admin` y se muestra en la ruta `/about`, fuera de la portada de tienda.
- Contact tiene ruta `/contact`, abre un borrador `mailto:` dirigido a `CONTACT_EMAIL` y ofrece WhatsApp personalizado a +57 319 558 3957; el envío directo con Resend queda como posible evolución.

