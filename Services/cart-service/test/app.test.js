const request = require('supertest');
const { app } = require('../src');

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
});
