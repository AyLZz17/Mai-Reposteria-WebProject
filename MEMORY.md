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
- UX/UI 26.1: se mejoraron jerarquia visual de portada, tarjetas adaptables y foco visible; los puntos 4 (busqueda) y 5 (normalizacion de precios) estan hechos; 6 a 9 siguen pendientes.
- About ahora usa `storefront_settings.about_text`; se edita desde Portada en `/admin` y se muestra en la ruta `/about`, fuera de la portada de tienda.
- Contact tiene ruta `/contact`, abre un borrador `mailto:` dirigido a `CONTACT_EMAIL` y ofrece WhatsApp personalizado a +57 319 558 3957; el envío directo con Resend queda como posible evolución.

- Busqueda del catalogo: la lupa en Home y Shop abre una busqueda por nombre, categoria, descripcion, slug, precio y disponibilidad; los resultados filtran productos activos y la consulta se conserva en la URL.
- Precios del catalogo: PostgreSQL devuelve DECIMAL como texto (p. ej. "15000.00"); la portada lo convierte a COP numerico antes de formatear y agregarlo al carrito.
