# Listado HU

## Visión
Las historias de usuario describen las necesidades del cliente y de la administradora para orientar el desarrollo del sistema. Cada una está redactada con su rol, el objetivo y el beneficio esperado.

## HU-01 – Ver el menú
Como cliente, quiero ver el menú organizado por categorías, para conocer qué productos están disponibles.

### Criterios de aceptación
- Se visualizan productos con nombre, imagen, descripción y precio.
- Los productos se agrupan por categoría.
- Los productos no disponibles se indican claramente.

## HU-02 – Ver el producto destacado
Como cliente, quiero ver el producto en tendencia del mes, para conocer las recomendaciones del negocio.

### Criterios de aceptación
- Hay una sección visible con el producto destacado.
- La administradora puede cambiar el producto destacado.
- El producto mostrado pertenece al catálogo actual.

## HU-03 – Iniciar sesión con Google
Como usuario, quiero iniciar sesión con mi cuenta de Google, para entrar rápido sin crear ni recordar otra contraseña.

### Criterios de aceptación
- Existe un botón para autenticarse con Google.
- El sistema crea el perfil del usuario si es la primera vez.
- La sesión queda activa durante el uso de la aplicación.

## HU-04 – Agregar productos al carrito
Como cliente, quiero agregar productos al carrito, para armar mi pedido antes de comprar.

### Criterios de aceptación
- Se pueden agregar, quitar y cambiar cantidades.
- El subtotal se actualiza automáticamente.
- El carrito permanece activo durante la sesión.

## HU-05 – Personalizar el pedido
Como cliente, quiero escribir comentarios o instrucciones especiales, para personalizar mi pedido.

### Criterios de aceptación
- Se incluye un campo de comentarios visible durante el checkout.
- El comentario se guarda con el pedido.
- El campo es opcional.

## HU-06 – Elegir entrega o retiro
Como cliente, quiero elegir domicilio o recoger el pedido en el punto de venta, para decidir la forma de entrega.

### Criterios de aceptación
- Existe una selección entre domicilio y recogida.
- Si se elige domicilio, se calcula el costo automáticamente.
- El total final se muestra antes de confirmar la compra.

## HU-07 – Pagar el pedido
Como cliente, quiero pagar con diferentes opciones, para usar el método que me convenga.

### Criterios de aceptación
- El checkout muestra Google Pay, PSE, tarjeta y contra entrega.
- El pedido cambia de estado según el tipo de pago.
- Los datos de la tarjeta no se almacenan en la base de datos propia.

## HU-08 – Guardar historial y recomendaciones
Como cliente registrado, quiero que el sistema guarde mi historial de pedidos y me recomiende productos según lo que suelo pedir, para encontrar más fácil lo que me gusta.

### Criterios de aceptación
- Cada pedido queda asociado al usuario.
- El sistema identifica patrones de compra.
- Las recomendaciones aparecen en el menú o en la pantalla principal.

## HU-09 – Dejar reseña del pedido
Como cliente, quiero dejar una reseña de mi pedido una vez lo haya recibido, para contar cómo me pareció ese producto o pedido en particular.

### Criterios de aceptación
- La reseña solo está disponible para pedidos entregados.
- La reseña incluye calificación y comentario opcional.
- La reseña queda asociada al pedido y al cliente.

## HU-10 – Dejar reseña general del negocio
Como cliente, quiero dejar una reseña general sobre el negocio, sin que tenga que estar ligada a un pedido en específico, para dar mi opinión del emprendimiento en general.

### Criterios de aceptación
- Hay una sección pública de reseñas generales.
- Solo pueden publicar reseñas usuarios autenticados con compras previas.
- Se visualiza un promedio de calificación.

## HU-11 – Administrar el menú
Como administradora, quiero poder agregar, editar o desactivar productos del menú, para mantenerlo actualizado sin depender de que alguien más lo haga por mí.

### Criterios de aceptación
- La administradora puede crear, editar o desactivar productos.
- Los cambios se reflejan inmediatamente en el menú público.
- Las categorías y precios se actualizan sin tocar el código.

## HU-12 – Administrar el producto destacado
Como administradora, quiero elegir y cambiar el producto destacado del mes, para promocionar lo que más me convenga según la temporada o lo que se esté vendiendo más.

### Criterios de aceptación
- Solo puede haber un producto destacado activo a la vez.
- El producto elegido debe estar disponible en el catálogo.
- El cambio se refleja inmediatamente en la página principal.

## HU-13 – Administrar los pedidos
Como administradora, quiero ver los pedidos que van llegando y poder cambiar su estado, para hacerles seguimiento desde que se hacen hasta que se entregan.

### Criterios de aceptación
- Se visualiza un listado de pedidos con cliente, productos y comentarios.
- Se puede cambiar el estado del pedido.
- Cada cambio queda registrado con fecha.


