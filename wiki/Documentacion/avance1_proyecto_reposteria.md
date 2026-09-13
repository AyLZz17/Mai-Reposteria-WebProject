# Avance 1 de Proyecto – Plataforma Web para Repostería (Ibagué)

## 1. Contexto del Trabajo

### 1.1 Problemática

La emprendedora con la que trabajamos tiene un negocio de repostería en Ibagué, especializado en tortas y galletas, pero no tiene ninguna página o plataforma propia. Todo lo maneja por redes sociales y WhatsApp: ahí le llegan los pedidos, ahí habla con los clientes y ahí le dejan comentarios sobre lo que compraron. El problema es que este método manual le está generando varios inconvenientes:

- No tiene un canal fijo y ordenado para recibir pedidos personalizados, todo llega mezclado entre mensajes de WhatsApp.
- Se le presentan errores al tomar los pedidos, sobre todo cuando el cliente pide algo personalizado en la torta (mensaje, sabor, decoración, etc.).
- No hay forma de saber qué ha comprado antes cada cliente, porque no queda ningún historial guardado.
- No existe un carrito de compras ni nada parecido, cada pedido se arma "a mano" en el chat.
- Calcular el domicilio depende de que ella misma revise la dirección y diga cuánto cuesta, no hay nada automático.
- No maneja ningún medio de pago digital, todo se coordina por fuera (transferencia, efectivo, etc.).
- No tiene cómo mostrar reseñas de clientes anteriores que le den confianza a los nuevos.
- El menu que muestra en redes no se actualiza seguido y no resalta lo que más se está vendiendo o lo que está de moda ese mes.

### 1.2 Relevancia del proyecto

Este proyecto es útil porque le permitiría a la emprendedora dejar de depender tanto de las redes sociales y tener un canal propio para vender. Con una plataforma web podría:

- Verse un poco más profesional frente a otros negocios similares
- Ahorrar tiempo y cometer menos errores, en especial con los pedidos que llevan personalización
- Recibir más pedidos sin tener que estar pendiente del chat todo el día
- Ir conociendo mejor a sus clientes (qué piden más, qué les gusta) para tomar decisiones con esa información
- Ofrecer una compra más completa: personalizar el producto, pagar en línea y hacer seguimiento del pedido
- Fidelizar clientes con reseñas, recomendaciones y una cuenta de usuario

### 1.3 Qué se va a hacer y para quién

Se va a desarrollar una aplicación web tipo e-commerce (frontend, backend con API y base de datos), donde el inicio de sesión se hace con la cuenta de Google. Va dirigida a dos tipos de usuario:

- **Clientes**: personas de Ibagué y alrededores que quieran ver el menú, hacer pedidos personalizados, pagarlos en línea o contra entrega, y dejar su opinión sobre el producto o el negocio
- **La administradora (la emprendedora)**: es quien va a manejar el menú, ver los pedidos que van llegando y hacerles seguimiento.

La idea es que el sistema se pueda ir mejorando después, es decir, que se puedan cambiar precios, agregar productos nuevos o añadir funciones sin tener que rehacer todo desde cero

### 1.4 Funcionalidades relevantes

1. Menú de productos organizado por categorías (tortas, galletas, especiales)
2. Sección de "producto en tendencia del mes", que la administradora puede cambiar
3. Carrito de compras donde se pueden agregar, quitar o cambiar cantidades
4. Un espacio para dejar comentarios o instrucciones especiales del pedido (mensaje, sabor, alergias, etc...)
5. Opción de elegir entre domicilio (con costo calculado automáticamente) o recoger el pedido en el punto de venta
6. Métodos de pago: Google Pay, PSE, tarjeta y contra entrega
7. Inicio de sesión únicamente con Google, sin crear usuario y contraseña aparte
8. Guardado del historial de pedidos de cada usuario y una recomendación básica de productos según lo que ha pedido antes
9. Reseñas que el cliente puede dejar después de recibir su pedido
10. Reseñas generales sobre el negocio, visibles para cualquier persona que entre a la página
11. Un panel donde la administradora puede crear, editar o desactivar productos del menú y cambiar el producto en tendencia
12. Un espacio donde la administradora puede ver los pedidos y actualizar su estado (en preparación, listo, entregado, etc...)

---

## 2. Historias de Usuario

Formato: **Como** [rol], **quiero** [acción], **para** [beneficio]. Cada una tiene sus criterios de aceptación

---

**HU-01 – Ver el menú**
Como cliente, quiero ver el menú de productos organizado por categorías, para saber qué opciones hay antes de comprar.

*Criterios de aceptación:*
- Se muestran los productos con nombre, imagen, descripción corta y precio.
- Están agrupados por categoría (tortas, galletas, especiales).
- Si un producto no está disponible, se avisa (por ejemplo "agotado") y no se puede agregar al carrito.

---

**HU-02 – Ver el producto en tendencia**
Como cliente, quiero ver cuál es el producto en tendencia o destacado del mes, para enterarme qué está siendo más pedido o recomendado.

*Criterios de aceptación:*
- Hay una sección o banner visible en la página principal con este producto.
- La administradora puede cambiar cuál es el producto en tendencia.
- El producto que se muestra pertenece al catálogo actual y se ve su imagen, nombre y precio.

---

**HU-03 – Iniciar sesión con Google**
Como usuario, quiero iniciar sesión con mi cuenta de Google, para entrar rápido sin tener que crear ni recordar otra contraseña.

*Criterios de aceptación:*
- Hay un botón de "Iniciar sesión con Google" que lleva al proceso de autenticación de Google.
- Si es la primera vez que entra, el sistema crea el perfil automáticamente con los datos básicos (nombre, correo, foto).
- Después de autenticarse, el sistema reconoce al usuario y mantiene la sesión iniciada.
- No se guarda la contraseña de Google del usuario en ningún momento.

---

**HU-04 – Agregar productos al carrito**
Como cliente, quiero agregar productos a un carrito, para ir armando mi pedido antes de pagarlo.

*Criterios de aceptación:*
- Se pueden agregar, quitar y cambiar cantidades de los productos.
- El subtotal se actualiza automáticamente cada vez que se modifica el carrito.
- El carrito se mantiene mientras la sesión siga activa.

---

**HU-05 – Personalizar el pedido**
Como cliente, quiero poder escribir comentarios o pedir cosas especiales en mi pedido (mensaje en la torta, sabor, alguna alergia, etc.), para que quede como yo lo necesito.

*Criterios de aceptación:*
- Hay un campo de texto visible (no escondido) antes de terminar la compra, con un límite de caracteres.
- El comentario se guarda junto con el pedido y la administradora lo puede ver.
- El campo es opcional, o sea que no impide terminar la compra si se deja vacío.

---

**HU-06 – Elegir entrega y ver el costo de domicilio**
Como cliente, quiero elegir si quiero domicilio o recoger el pedido en el punto de venta, y saber cuánto cuesta el domicilio antes de pagar, para decidir según lo que más me convenga.

*Criterios de aceptación:*
- En el checkout hay que elegir entre "domicilio" o "recoger en tienda".
- Si se elige domicilio, se calcula el costo según la zona y se suma al total.
- Si se elige recoger, el costo de domicilio queda en $0.
- El total final (productos más domicilio, si aplica) se ve claro antes de confirmar el pago.

---

**HU-07 – Pagar el pedido**
Como cliente, quiero pagar con Google Pay, PSE, tarjeta o contra entrega, para usar el método que me quede más fácil.

*Criterios de aceptación:*
- El checkout muestra las 4 opciones de pago mencionadas.
- Si el pago en línea es exitoso, el pedido pasa a estado "pagado" o "confirmado".
- Si se elige contra entrega, el pedido queda como "pendiente de pago" pero de igual forma se manda a preparación.
- No se guardan los datos de la tarjeta directamente en la base de datos del sistema.

---

**HU-08 – Guardar historial y recibir recomendaciones**
Como cliente registrado, quiero que el sistema guarde mi historial de pedidos y me recomiende productos según lo que suelo pedir, para encontrar más fácil lo que me gusta.

*Criterios de aceptación:*
- Cada pedido queda guardado y asociado al usuario que inició sesión.
- Existe alguna lógica que identifique productos que el usuario pide seguido o parecidos, para sugerirlos.
- Las recomendaciones aparecen en el menú o en la página de inicio del usuario.
- Si un usuario es nuevo y no tiene historial, el sistema sigue funcionando normal, solo no muestra recomendaciones.

---

**HU-09 – Dejar reseña después de recibir el pedido**
Como cliente, quiero dejar una reseña de mi pedido una vez lo haya recibido, para contar cómo me pareció ese producto o pedido en particular.

*Criterios de aceptación:*
- La opción de reseña solo aparece cuando el pedido ya está marcado como "entregado".
- La reseña incluye una calificación de 1 a 5 estrellas y un comentario que es opcional.
- Queda asociada al pedido y se puede ver en el historial del cliente.

---

**HU-10 – Dejar reseña general del negocio**
Como cliente, quiero dejar una reseña general sobre el negocio, sin que tenga que estar ligada a un pedido en específico, para dar mi opinión del emprendimiento en general.

*Criterios de aceptación:*
- Hay una sección de reseñas generales visible para cualquiera que entre a la página.
- Solo puede dejar reseña un usuario que haya iniciado sesión y ya haya comprado antes.
- Se muestra un promedio de calificación en la página principal.

---

**HU-11 – Administrar el menú**
Como administradora, quiero poder agregar, editar o desactivar productos del menú, para mantenerlo actualizado sin depender de que alguien más lo haga por mí.

*Criterios de aceptación:*
- Puedo crear un producto con nombre, descripción, precio, categoría e imagen.
- Puedo editar o desactivar un producto (no borrarlo por completo).
- Los cambios se ven reflejados de una vez en el menú que ven los clientes.

---

**HU-12 – Administrar el producto en tendencia**
Como administradora, quiero elegir y cambiar el producto destacado del mes, para promocionar lo que más me conviene según la temporada o lo que se esté vendiendo más.

*Criterios de aceptación:*
- Solo puede haber un producto destacado activo a la vez.
- El producto que se elija debe estar disponible en el catálogo.
- El cambio se refleja de inmediato en la sección destacada.

---

**HU-13 – Administrar los pedidos**
Como administradora, quiero ver los pedidos que van llegando y poder cambiar su estado, para hacerles seguimiento desde que se hacen hasta que se entregan.

*Criterios de aceptación:*
- Puedo ver el listado de pedidos con el cliente, los productos, los comentarios, el método de pago y el de entrega.
- Puedo cambiar el estado del pedido (en preparación, listo, entregado, etc.).
- Cada cambio de estado queda con su fecha registrada.

---

## 3. Requerimientos No Funcionales

Se clasifican según el atributo de calidad al que corresponden y se ordenan por prioridad.

| Prioridad | ID | Requerimiento no funcional | Atributo de calidad |
|-----------|--------|-----------------------------------------------------------------------------------------------------|------------------------------|
| **Alta** | RNF-01 | La comunicación entre el frontend, el backend y la pasarela de pagos debe ir cifrada con HTTPS/SSL. | Seguridad |
| **Alta** | RNF-02 | Los datos de la tarjeta no se guardan en la base de datos del sistema; eso lo maneja la pasarela de pagos. | Seguridad |
| **Alta** | RNF-03 | Las páginas de administración solo las puede ver y usar la administradora, una vez autenticada. | Seguridad |
| **Alta** | RNF-04 | El proceso de pago debería demorar menos de 5 segundos en condiciones normales de conexión. | Rendimiento |
| **Alta** | RNF-05 | El inicio de sesión con Google debería tardar menos de 3 segundos. | Rendimiento |
| **Alta** | RNF-06 | La aplicación debe estar disponible casi todo el tiempo (cerca del 99%), para no perder pedidos por caídas del sistema. | Disponibilidad |
| **Alta** | RNF-07 | La interfaz debe verse y funcionar bien tanto en celular como en computador, priorizando el celular porque es lo que más usan los clientes. | Usabilidad |
| **Media**| RNF-08 | Se deben poder agregar o cambiar productos y categorías sin tener que tocar el código del sistema. | Mantenibilidad |
| **Media**| RNF-09 | El sistema debe ser fácil de usar aunque la persona no tenga experiencia con tecnología (máximo 3 pasos para completar un pedido). | Usabilidad |
| **Media**| RNF-10 | El backend debería estar organizado de forma que sea fácil agregar después nuevos métodos de pago u otras funciones. | Mantenibilidad |
| **Media**| RNF-11 | Los valores del carrito, el domicilio y el total deben cuadrar siempre y no mostrar datos inconsistentes. | Integridad |
| **Baja** | RNF-12 | El sistema debería aguantar que crezca la cantidad de usuarios sin que se ponga lento. | Escalabilidad |
| **Baja** | RNF-13 | El código y la base de datos deben tener algo de documentación para que se puedan entender más adelante. | Mantenibilidad |
| **Baja** | RNF-14 | El sistema se podría llegar a montar en distintos servicios de hosting o nube en el futuro. | Portabilidad |

---

## 5. Interacción con stakeholders

### 5.1 Validación de requerimientos

Durante las reuniones con la emprendedora y el equipo se validaron los principales aspectos del proyecto, especialmente los relacionados con la venta online, la organización de los pedidos y la necesidad de digitalizar el proceso que actualmente se maneja por WhatsApp.

Los puntos que más se confirmaron fueron:

- La necesidad de contar con una plataforma web propia para vender tortas, galletas y productos personalizados.
- La importancia de centralizar y ordenar los pedidos, evitando que queden mezclados en conversaciones de mensajería.
- La prioridad de que el cliente pueda personalizar sus pedidos, elegir entrega o retiro, y pagar por diferentes medios.
- La conveniencia de usar inicio de sesión con Google para simplificar el acceso y reducir fricción en la compra.
- La necesidad de un panel administrativo que permita manejar el menú, el producto en tendencia y los pedidos con seguimiento.

### 5.2 Observaciones y ajustes derivados

A partir de las conversaciones con los stakeholders se hicieron los ajustes necesarios para alinear el proyecto con las expectativas reales del negocio:

- Se confirmó que la experiencia móvil debe priorizarse, ya que es el canal más usado por los clientes.
- Se reforzó la necesidad de que el carrito, el checkout y la gestión de pagos sean claros y sencillos de usar.
- Se validó que la administración debe permitir actualizar el catálogo rápidamente sin requerir intervención técnica constante.
- Se acordó que la plataforma debe ofrecer una experiencia más profesional que lo que se maneja hoy por redes sociales, pero manteniendo una operación sencilla y accesible.
- Se dejó claro que los mockups y prototipos ya desarrollados son una base útil para validar la interfaz con los interesados antes de avanzar con la implementación.

### 5.3 Resultado de la validación

La documentación del proyecto ya cuenta con una base de requerimientos validada por los stakeholders, con una visión clara del problema, los usuarios, las funcionalidades clave y el diseño general del sistema. El alcance principal quedó orientado a una solución funcional, moderna y fácil de usar para clientes y administradora.

Además, los mockups ya se consideran cumplidos, por lo que el punto de diseño visual queda satisfecho de manera concreta. Lo que sigue pendiente es definir detalles técnicos de implementación, como la base de datos final que se va a usar y la integración exacta con pagos.
