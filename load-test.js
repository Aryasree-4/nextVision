const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';
const CONCURRENT_USERS = 50;

async function simulateUser(id) {
    const start = Date.now();
    try {
        const client = axios.create({ baseURL: API_URL });
        const email = `loaduser${id}_${Date.now()}@example.com`;

        // 1. Register
        await client.post('/register', {
            name: `Load Test User`,
            email,
            password: 'Password123!'
        });

        // 2. Login
        const res = await client.post('/login', {
            email,
            password: 'Password123!'
        });

        const duration = Date.now() - start;
        return { id, success: true, duration };
    } catch (error) {
        let errorMsg = error.message;
        if (error.response && error.response.data) {
            errorMsg += ` - ${JSON.stringify(error.response.data)}`;
        }
        return { id, success: false, error: errorMsg, duration: Date.now() - start };
    }
}

async function runLoadTest() {
    console.log(`--- Starting Load Test with ${CONCURRENT_USERS} concurrent users ---`);
    const start = Date.now();

    const promises = Array.from({ length: CONCURRENT_USERS }, (_, i) => simulateUser(i));
    const results = await Promise.all(promises);

    const totalTime = Date.now() - start;
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);
    const avgDuration = successes.reduce((acc, r) => acc + r.duration, 0) / (successes.length || 1);

    console.log('\n--- Load Test Results ---');
    console.log(`Total Requests: ${CONCURRENT_USERS}`);
    console.log(`Successes:      ${successes.length}`);
    console.log(`Failures:       ${failures.length}`);
    console.log(`Avg Latency:    ${avgDuration.toFixed(2)}ms`);
    console.log(`Total Time:     ${totalTime}ms`);

    if (failures.length > 0) {
        console.log('\nSample Failure:', failures[0].error);
    }
}

runLoadTest();
