const request = require('supertest');
const app = require('../index');
const pool = require('../db/pool');

describe('Clients API', () => {

    it('GET /api/clients should return an array', async () => {
        const res = await request(app).get('/api/clients');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /api/clients should create new client', async () => {
        const res = await request(app)
            .post('/api/clients')
            .send({name: 'Test Client', phone: '071 000 0000'});
        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('Test Client');
        expect(res.body.phone).toBe('071 000 0000');
        expect(res.body.id).toBeDefined();
    });

    it('POST /api/clients should return 400 if name is missing', async () => {
        const res = await request(app)
            .post('/api/clients')
            .send({phone: '071 000 0000'});
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Name is required');
    });
});