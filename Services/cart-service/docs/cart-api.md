# Cart API

Base URL: `http://localhost:3001`

## Health

`GET /health`

## Obtener carrito

`GET /api/cart?userId=demo-user`

## Agregar producto

`POST /api/cart/items`

Body:

```json
{
  "userId": "demo-user",
  "productId": "torta-chocolate",
  "name": "Torta de chocolate",
  "price": 45000,
  "quantity": 2
}
```

## Actualizar cantidad

`PATCH /api/cart/items/:productId`

Body:

```json
{
  "userId": "demo-user",
  "quantity": 3
}
```

## Eliminar producto

`DELETE /api/cart/items/:productId?userId=demo-user`
