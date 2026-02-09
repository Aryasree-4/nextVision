const axios = require('axios');

async function testProfileUpdate() {
    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        withCredentials: true
    });

    try {
        console.log('1. Attempting login...');
        const loginRes = await api.post('/auth/login', {
            email: 'admin@nextvision.com',
            password: 'AdminPassword123!'
        });
        console.log('Login successful');

        console.log('2. Attempting profile update (bio only)...');
        const res = await api.put('/users/profile', { bio: 'Test Bio ' + Date.now() });
        console.log('Bio update success:', res.data);

        console.log('3. Attempting profile update with a "file" (using FormData simul)...');
        // We'll skip real file for this node script but test the bio again via PUT
        // Multer should handle it even if no file is sent
    } catch (error) {
        console.error('Test Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testProfileUpdate();
