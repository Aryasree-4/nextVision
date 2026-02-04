const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5000/api/auth';
const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    validateStatus: () => true // Handle errors manually
});

async function runTest() {
    console.log('--- Starting Role Integration Test ---');

    const timestamp = Date.now();
    const learnerUser = {
        name: 'Learner User',
        email: `learner${timestamp}@example.com`,
        password: 'Password1!',
        role: 'learner'
    };

    const mentorUser = {
        name: 'Mentor User',
        email: `mentor${timestamp}@example.com`,
        password: 'Password1!',
        role: 'mentor'
    };

    try {
        // 1. Register Learner
        console.log('1. Testing Register Learner...');
        let res = await client.post('/register', learnerUser);
        console.log(`   Status: ${res.status}`);
        if (res.status !== 201) console.log(res.data);
        assert.strictEqual(res.status, 201, 'Register learner should return 201');
        assert.strictEqual(res.data.role, 'learner', 'Role should be learner');

        // 2. Register Mentor
        console.log('2. Testing Register Mentor...');
        res = await client.post('/register', mentorUser);
        console.log(`   Status: ${res.status}`);
        if (res.status !== 201) console.log(res.data);
        assert.strictEqual(res.status, 201, 'Register mentor should return 201');
        assert.strictEqual(res.data.role, 'mentor', 'Role should be mentor');

        // 3. Login as Mentor and check role
        console.log('3. Testing Login as Mentor...');
        res = await client.post('/login', { email: mentorUser.email, password: mentorUser.password });
        console.log(`   Status: ${res.status}`);
        assert.strictEqual(res.status, 200, 'Login should return 200');
        assert.strictEqual(res.data.role, 'mentor', 'Login response should include correct role');

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
