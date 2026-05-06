const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

async function test() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true });
    
    // Register unique user
    const email = 'admin_' + Date.now() + '@test.com';
    const resReg = await api.post('/auth/register', {
      name: 'Admin Test', 
      email, 
      password: 'Password123!', 
      role: 'mentor',
      securityQuestion: 'What is your pet name?',
      securityAnswer: 'Fluffy'
    });
    let cookie = resReg.headers['set-cookie'][0];
    const userId = resReg.data._id;

    // Connect to DB and make them admin
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.collection('users').updateOne({ _id: new mongoose.Types.ObjectId(userId) }, { $set: { role: 'admin' } });
    await mongoose.disconnect();

    // Create a dummy image
    const dummyImagePath = path.join(__dirname, 'dummy.png');
    fs.writeFileSync(dummyImagePath, 'dummy image content');

    // Create Course
    const form = new FormData();
    form.append('title', 'Simulation Singularity Studies');
    form.append('description', 'Introduction to Simulation Singularity');
    form.append('isPublished', 'false');
    form.append('modules', '[]');
    form.append('coverImage', fs.createReadStream(dummyImagePath));
    
    const resCourse = await api.post('/courses', form, {
      headers: {
        ...form.getHeaders(),
        Cookie: cookie
      }
    });
    console.log('Success:', resCourse.data);
    
    // Cleanup
    fs.unlinkSync(dummyImagePath);
  } catch (err) {
    if(err.response) {
       console.log('Error Status:', err.response.status);
       console.log('Error Data:', JSON.stringify(err.response.data, null, 2));
    } else {
       console.error('Error:', err.message);
    }
  }
}
test();
