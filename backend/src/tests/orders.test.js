const request = require('supertest');
const app = require('../index');
const pool = require('../db/pool');
const { createTestUser, deleteTestUser } = require('./helpers/auth');

let token;
let testClientId;
let testOrderId;

describe('Orders API', () => {
  beforeAll(async () => {
    const result = await createTestUser();
    token = result.token;

    const res = await pool.query(
      `INSERT INTO clients (user_id, name, phone)
       VALUES ($1, 'Test Order Client', '072 000 0000') RETURNING *`,
      [result.user.id]
    );
    testClientId = res.rows[0].id;
  });

  it('GET /api/orders should return an array', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/orders should create a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client_id: testClientId,
        garment_type: 'Matric dance dress',
        deadline: '2026-12-01',
        price: 3000,
        deposit: 1500,
        fabric_notes: 'Red chiffon',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.garment_type).toBe('Matric dance dress');
    expect(res.body.client_id).toBe(testClientId);
    expect(res.body.id).toBeDefined();
    testOrderId = res.body.id;
  });

  it('GET /api/orders/:id should return the order', async () => {
    const res = await request(app)
      .get(`/api/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(testOrderId);
    expect(res.body.garment_type).toBe('Matric dance dress');
  });

  it('PUT /api/orders/:id should update the order status', async () => {
    const res = await request(app)
      .put(`/api/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        garment_type: 'Matric dance dress',
        status: 'progress',
        deadline: '2026-12-01',
        price: 3000,
        deposit: 1500,
        fabric_notes: 'Red chiffon',
        notes: '',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('progress');
  });

  it('GET /api/orders?status=progress should filter by status', async () => {
    const res = await request(app)
      .get('/api/orders?status=progress')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(order => {
      expect(order.status).toBe('progress');
    });
  });

  it('DELETE /api/orders/:id should delete the order', async () => {
    const res = await request(app)
      .delete(`/api/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  it('GET /api/orders/:id should return 404 for deleted order', async () => {
    const res = await request(app)
      .get(`/api/orders/${testOrderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});