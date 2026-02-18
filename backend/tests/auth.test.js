const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { app, server } = require('../server');

let mongoServer;

beforeAll(async () => {
    // Use memory server if MONGO_URI is not set or for testing isolation
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Close existing connections if any
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close(); // Close the http server instance
});

describe('Authentication API', () => {
    const testUser = {
        name: 'Test integration User',
        email: 'integration@example.com',
        password: 'Password123!',
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('name', testUser.name);
        expect(res.body).toHaveProperty('email', testUser.email);
    });

    it('should not register the same user twice', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(400);
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('email', testUser.email);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should get current user profile', async () => {
        // First login to get cookie
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        const cookie = loginRes.headers['set-cookie'];

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', cookie);

        expect(res.statusCode).toEqual(200);
        expect(res.body.email).toEqual(testUser.email);
    });

    it('should logout the user', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        const cookie = loginRes.headers['set-cookie'];

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', cookie);

        expect(res.statusCode).toEqual(200);
    });
});
