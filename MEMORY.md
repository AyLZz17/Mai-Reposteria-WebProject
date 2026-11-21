# MEMORY.md -- Memoria de corto plazo (max. 50 lineas)
> Se reescribe tras cada tarea. Lo critico y permanente se promueve a AGENTS.md.

- La portada del frontend consume /catalog/storefront y usa sus productos destacados.
- El panel /admin permite editar configuracion de portada y campos visuales de productos.
- Verificacion realizada: FrontEnd/npm run build pasa correctamente.
- El panel de productos incluye borrado permanente con confirmacion.
- SUPER_ADMIN dispone de la seccion Administradores para promover usuarios por correo; el backend valida el rol.
- Los administradores normales no ven la seccion de gestion de administradores.
- Un SUPER_ADMIN puede asignar y quitar el rol ADMIN por correo.
- La portada prioriza movil, conserva la paleta crema/cacao/terracota y presenta acceso directo al catalogo.
- UX/UI 26.1: se mejoraron jerarquia visual de portada, tarjetas adaptables y foco visible; busqueda y normalizacion de precios hechas; carrito mejorado; pie de pagina funcional.
- About usa storefront_settings.about_text; se edita desde Portada en Admin y se muestra en /about, fuera de la portada.
- Contact abre mailto a CONTACT_EMAIL y ofrece WhatsApp personalizado a +57 319 558 3957; Resend queda como posible evolucion.
- Busqueda del catalogo: lupa en Home y Shop busca por nombre, categoria, descripcion, slug, precio y disponibilidad; filtra productos activos y conserva consulta en URL.
- Precios: PostgreSQL devuelve DECIMAL como texto; portada normaliza a COP numerico antes de formatear/agregar al carrito.
- Cuenta SUPER_ADMIN local: superadmin.nuevo@mai-reposteria.invalid; login verificado por gateway; contrasena solo entregada en chat.
- Logs: acciones administrativas en admin_audit_logs y Admin > Auditoria (solo SUPER_ADMIN); logs tecnicos JSON en logs/, consultables con ./logs.ps1.
- Carrito: carga con error/reintento, estados accesibles, mutaciones bloqueadas durante guardado, UX movil e imagen/posicion persistidas.
- Altas catalogo: mai-caddy reiniciado; GET categorias 200; limite JSON/gateway 6 MiB; fallback gateway soporta mutaciones.
- Admin 401: si mai_access_token no existe o expira, limpiar usuario cacheado y redirigir a login.
- Footer: enlaces internos activos para tienda, pedidos, pagos, envios, resenas, contacto y ayuda; perfiles sociales editables en Admin > Portada.
- Checkout WhatsApp: ticket/snapshot en Mongo, precio y stock validados con catalogo, DELIVERY_FEE_COP, consentimiento de datos; estado inicial PENDING_CONFIRMATION.
- Pedidos: Admin > Pedidos carga por ticket, confirma pedido pendiente, edita manualmente estado y estimatedDeliveryDate; cambios auditados.
- Seguimiento publico: /pedido y /pedido/<ticket> exponen estado/ETA/items sin PII; refresca automaticamente cada 30 s.
- Mis pedidos: GET /api/cart/orders/mine filtra por el userId firmado, proyecta campos de seguimiento sin PII y limita a 50; /pedido muestra lista del cliente con refresco cada 30 s y conserva consulta de ticket.
- Navegacion: el menu superior de Home, Shop, About y Contact enlaza a /pedido con la opcion Seguir pedido.
- Resenas: catalogo persiste una por user/product en product_reviews; calificacion/comment validados, submission limitada a 10/hora. Publico ve solo APPROVED y promedio/count; Admin > Resenas modera y audita. GET publico con summary/lista; escritura protegida por JWT.
- Instalacion nueva: README documenta clonado, configuracion segura de .env, arranque/actualizacion Docker y diagnostico; .env.example incluye solo valores de ejemplo.
