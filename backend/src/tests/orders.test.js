const request = require('supertest');
const app = require('../index');
const pool = require('../db/pool');

let testClientId;
let testOrderId;

describe('Orders API', () => {
    beforeAll(async () => {
        const res = await pool.query(
            "INSERT INTO clients (name, phone) VALUES ('Test Order Client', '072 000 0000') RETURNING *"
        );
        testClientId = res.rows[0].id;
    });

    it('GET /api/orders should return an array', async () => {
        const res = await request(app).get('/api/orders');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/orders should create a new order', async () => {
        const res = await request(app)
            .post('/api/orders')
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
        const res = await request(app).get(`/api/orders/${testOrderId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(testOrderId);
        expect(res.body.garment_type).toBe('Matric dance dress');
    });

    it('PUT /api/orders/:id should update the order status', async () => {
        const res = await request(app)
            .put(`/api/orders/${testOrderId}`)
            .send({
                garment_type: 'Matric dance dress',
                status: 'progress',
                deadline: '2026-12-01',
                price:3000,
                deposit: 1500,
                fabric_notes: 'Red chiffon',
                notes: '',
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('progress');
    });

    it('GET /api/orders?status=progress should filter by status', async () => {
        const res = await request(app).get('/api/orders?status=progress');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        res.body.forEach(order => {
            expect(order.status).toBe('progress');
        });
    });

    it('DELETE /api/orders/:id should delete the order', async () => {
        const res = await request(app).delete(`/api/orders/${testOrderId}`);
        expect(res.statusCode).toBe(204);
    });

    it('GET /api/orders/:id should  return 404 for deleted order', async () => {
        const res = await request(app).get(`/api/orders/${testOrderId}`);
        expect(res.statusCode).toBe(404);
    });
});