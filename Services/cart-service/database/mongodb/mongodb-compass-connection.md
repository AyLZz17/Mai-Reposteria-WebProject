# Configuración de MongoDB Compass - Servicio de Carrito

## Estado: MongoDB Server ya está instalado y corriendo

MongoDB Community Server 9.0.2 fue instalado automáticamente y está corriendo como servicio de Windows.

## Conexión a MongoDB

### Parámetros de conexión

| Parámetro | Valor |
|-----------|-------|
| **Host** | `localhost` |
| **Port** | `27017` |
| **Database** | `mai_cart_service` |
| **Username** | (ninguno por ahora) |
| **Password** | (ninguna por ahora) |

### Connection String

```
mongodb://localhost:27017/mai_cart_service
```

### Pasos para conectar en MongoDB Compass

1. **Abrir MongoDB Compass** (ya está instalado en tu máquina)

2. **Crear nueva conexión:**
   - Click en "New Connection"
   - Pegar el connection string: `mongodb://localhost:27017/mai_cart_service`
   - Click en "Connect"

3. **La base de datos y colección `carts` ya están creadas** con todos los índices necesarios

4. **Importar datos de ejemplo:**
   - Click en la colección `carts`
   - Click en "Add Data" > "Import File"
   - Seleccionar el archivo `seed.example.json` (ubicado en `services/cart-service/database/mongodb/`)
   - Formato: JSON
   - Click en "Import"

### Verificar que todo está correcto

Ejecutar en mongosh o terminal de Compass:

```javascript
// Ver bases de datos
show dbs

// Ver colecciones en mai_cart_service
use mai_cart_service
show collections

// Ver índices de la colección carts
db.carts.getIndexes()

// Ver datos de ejemplo (después de importar)
db.carts.find().pretty()
```

### Crear el esquema de validación (opcional, para validación estricta)

```javascript
db.createCollection("carts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "items", "createdAt", "updatedAt"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        sessionId: { bsonType: "string" },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["productId", "name", "quantity", "unitPrice", "subtotal"],
            properties: {
              productId: { bsonType: "string" },
              name: { bsonType: "string" },
              quantity: { bsonType: "int", minimum: 1 },
              unitPrice: { bsonType: "double", minimum: 0 },
              subtotal: { bsonType: "double", minimum: 0 },
              imageUrl: { bsonType: "string" },
              notes: { bsonType: "string" },
              addedAt: { bsonType: "date" }
            }
          }
        },
        totalItems: { bsonType: "int" },
        subtotal: { bsonType: "double" },
        discount: { bsonType: "double" },
        total: { bsonType: "double" },
        currency: { bsonType: "string", enum: ["COP", "USD"] },
        status: { bsonType: "string", enum: ["active", "abandoned", "converted", "expired"] },
        expiresAt: { bsonType: "date" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});
```

### Consultas útiles

```javascript
// Ver carrito activo de un usuario
db.carts.findOne({ userId: "user_001", status: "active" });

// Ver todos los carritos activos
db.carts.find({ status: "active" });

// Ver carritos que expiran pronto (próximas 24 horas)
db.carts.find({
  status: "active",
  expiresAt: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }
});

// Agregar un producto al carrito
db.carts.updateOne(
  { userId: "user_001", status: "active" },
  {
    $push: {
      items: {
        productId: "prod_003",
        name: "Galleta de Avena",
        quantity: 3,
        unitPrice: 5000.00,
        subtotal: 15000.00,
        imageUrl: "https://example.com/images/galleta.jpg",
        notes: "",
        addedAt: new Date()
      }
    },
    $inc: { totalItems: 3, subtotal: 15000.00, total: 15000.00 },
    $set: { updatedAt: new Date() }
  }
);

// Actualizar cantidad de un producto
db.carts.updateOne(
  { userId: "user_001", "items.productId": "prod_001" },
  {
    $set: {
      "items.$.quantity": 2,
      "items.$.subtotal": 70000.00,
      updatedAt: new Date()
    }
  }
);

// Eliminar un producto del carrito
db.carts.updateOne(
  { userId: "user_001" },
  {
    $pull: { items: { productId: "prod_001" } },
    $set: { updatedAt: new Date() }
  }
);

// Vaciar el carrito
db.carts.updateOne(
  { userId: "user_001", status: "active" },
  {
    $set: {
      items: [],
      totalItems: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
      updatedAt: new Date()
    }
  }
);
```

## Notas importantes

- **Inicio automático:** MongoDB Server está configurado como servicio de Windows y arranca automáticamente
- **Datos:** Directorio de datos en `C:\data\db`
- **Backups:** Usar `mongodump` para copias de seguridad
- **Producción:** Configurar autenticación y variables de entorno para credenciales
