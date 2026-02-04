const axios = require('axios');
const assert = require('assert');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api';
const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    validateStatus: () => true
});

async function runTest() {
    console.log('--- Starting Course Management Test ---');

    try {
        // 1. Login as Admin
        console.log('1. Logging in as Admin...');
        let res = await client.post('/auth/login', {
            email: 'admin@nextvision.com',
            password: 'AdminPassword123!'
        });
        const cookies = res.headers['set-cookie'];
        const headers = { Cookie: cookies };
        assert.strictEqual(res.status, 200);

        // 2. Create Course
        console.log('2. Creating a new Course...');
        const form = new FormData();
        form.append('title', 'Intro to AI');
        form.append('description', 'Learn the basics of AI');
        form.append('isPublished', 'true');
        form.append('modules', JSON.stringify([{ title: 'Module 1', topics: [{ title: 'History', content: '# AI History' }] }]));
        // Note: For real file upload test we need a file. We'll skip file or create dummy if needed. 
        // passing 'courses' endpoint expecting multipart

        // We need headers for multipart form data
        const formHeaders = form.getHeaders();
        Object.assign(headers, formHeaders);

        res = await client.post('/courses', form, { headers });
        console.log(`   Create Status: ${res.status}`);
        if (res.status !== 201) console.log(res.data);
        assert.strictEqual(res.status, 201);
        const courseId = res.data._id;
        console.log('   Course Created:', courseId);

        // 3. Verify Learner Can See It
        // Login as Learner
        console.log('3. Checking Learner View...');
        res = await client.post('/auth/login', {
            email: 'learner1714@example.com', // Assuming this user exists from previous tests or create new
            // actually we need to register one or assume one. Let's register quick to be safe
            // Or better, just check public endpoint if we allowed it? No, it's protected.
        });

        // Let's create a fresh learner for this test
        const timestamp = Date.now();
        res = await client.post('/auth/register', {
            name: 'Course Test User',
            email: `coursetest${timestamp}@example.com`,
            password: 'Password1!',
            role: 'learner'
        });
        const learnerCookie = res.headers['set-cookie'];
        const learnerHeaders = { Cookie: learnerCookie };

        res = await client.get('/courses?published=true', { headers: learnerHeaders });
        console.log(`   Fetch Status: ${res.status}`);
        const found = res.data.find(c => c._id === courseId);
        assert.ok(found, 'Learner should see the published course');
        console.log('   Learner sees the course.');

        // 4. Delete Course (Admin)
        console.log('4. Deleting Course (Admin)...');
        res = await client.delete(`/courses/${courseId}`, { headers: { Cookie: cookies } }); // Use admin cookies
        console.log(`   Delete Status: ${res.status}`);
        assert.strictEqual(res.status, 200);

        console.log('--- Course Management Test Passed! ---');

    } catch (error) {
        console.error('--- Test Failed ---');
        console.error(error.message);
        if (error.response) console.error(error.response.data);
    }
}

runTest();
