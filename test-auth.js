const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5000/api/auth';
const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    validateStatus: () => true // Handle errors manually
});

async function runTest() {
    console.log('--- Starting Auth API Test ---');

    const testUser = {
        name: 'Test Script User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
    };

    try {
        // 1. Register
        console.log('1. Testing Register...');
        let res = await client.post('/register', testUser);
        console.log(`   Status: ${res.status}`);
        assert.strictEqual(res.status, 201, 'Register should return 201');

        // Capture cookies
        const cookies = res.headers['set-cookie'];
        assert.ok(cookies, 'Should receive cookies');
        console.log('   Cookies received:', cookies);

        const headers = { Cookie: cookies };

        // 2. Get Me (Logged In)
        console.log('2. Testing Get Me (Authenticated)...');
        res = await client.get('/me', { headers });
        console.log(`   Status: ${res.status}, User: ${res.data.name}`);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.data.email, testUser.email);

        // 3. Logout
        console.log('3. Testing Logout...');
        res = await client.post('/logout', {}, { headers });
        console.log(`   Status: ${res.status}`);
        assert.strictEqual(res.status, 200);

        // 4. Get Me (Logged Out)
        // Note: session cookie might be cleared or invalidated.
        // If we send the old cookie, it should be rejected or session not found.
        console.log('4. Testing Get Me (After Logout)...');
        res = await client.get('/me', { headers }); // Sending old cookie
        console.log(`   Status: ${res.status}`);
        assert.strictEqual(res.status, 401, 'Should be unauthorized');

        console.log('--- Test Passed Successfully! ---');

    } catch (error) {
        console.error('--- Test Failed ---');
        console.error(error.message);
        if (error.response) {
            console.error(error.response.data);
        }
    }
}

runTest();
