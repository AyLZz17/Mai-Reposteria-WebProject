const request = require('supertest');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test-secret-with-at-least-32-bytes-long';

jest.mock('../src/services/cart.service', () => ({
  getCart: jest.fn().mockResolvedValue({ items: [], totalItems: 0, subtotal: 0, total: 0 }),
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
}));

const { app } = require('../src');
const cartService = require('../src/services/cart.service');

describe('Cart service', () => {
  test('GET /health returns service status', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'cart-service' });
  });

  test('unknown route returns 404', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ error: 'Route not found' });
  });

  test('cart routes require an access token', async () => {
    const responses = await Promise.all([
      request(app).get('/api/cart?userId=someone-else'),
      request(app).post('/api/cart/items').send({ userId: 'someone-else' }),
      request(app).patch('/api/cart/items/product-id').send({ userId: 'someone-else' }),
      request(app).delete('/api/cart/items/product-id?userId=someone-else'),
    ]);

    expect(responses.map((response) => response.statusCode)).toEqual([401, 401, 401, 401]);
  });

  test('cart ownership comes from the access token, not request parameters', async () => {
    const token = jwt.sign({ userId: 'authenticated-user', type: 'ACCESS' }, process.env.JWT_SECRET);

    await request(app)
      .get('/api/cart?userId=someone-else')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(cartService.getCart).toHaveBeenCalledWith('authenticated-user');
  });
});
