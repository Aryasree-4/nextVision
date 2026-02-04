const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5000/api/auth';
const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    validateStatus: () => true
});

async function runTest() {
    console.log('--- Starting Admin Login Test ---');

    const adminUser = {
        email: 'admin@nextvision.com',
        password: 'AdminPassword123!'
    };

    try {
        console.log('Testing Login as Admin...');
        const res = await client.post('/login', adminUser);
        console.log(`   Status: ${res.status}`);

        if (res.status !== 200) {
            console.error('Login failed:', res.data);
        }

        assert.strictEqual(res.status, 200, 'Login should return 200');
        assert.strictEqual(res.data.role, 'admin', 'Role should be admin');
        console.log('   Role verified: admin');

        console.log('--- Admin Test Passed Successfully! ---');

    } catch (error) {
        console.error('--- Test Failed ---');
        console.error(error.message);
    }
}

runTest();
