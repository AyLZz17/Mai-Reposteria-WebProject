// Índices para la colección de carritos en MongoDB
// Ejecutar en MongoDB Compass o mongosh

db.carts.createIndex({ "userId": 1 }, { unique: true, sparse: true });
db.carts.createIndex({ "sessionId": 1 }, { unique: true, sparse: true });
db.carts.createIndex({ "status": 1 });
db.carts.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.carts.createIndex({ "items.productId": 1 });
db.carts.createIndex({ "updatedAt": -1 });

// Índice compuesto para búsquedas comunes
db.carts.createIndex({ "userId": 1, "status": 1 });
