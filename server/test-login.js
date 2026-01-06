const axios = require('axios');

async function testLogin() {
    const baseURL = 'http://localhost:5000';
    const credentials = {
        email: 'admin@kubera.io',
        password: 'admin123'
    };

    try {
        console.log(`🔑 Attempting login with ${credentials.email}...`);
        const response = await axios.post(`${baseURL}/api/auth/login`, credentials);

        if (response.data.token) {
            console.log('✅ Login Successful!');
            console.log('Token received:', response.data.token.substring(0, 20) + '...');
            console.log('User Role:', response.data.user.role);
        } else {
            console.log('❌ Login failed: No token received.');
        }
    } catch (error) {
        console.error('❌ Login Error:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        // Also try the other admin email just in case
        if (credentials.email === 'admin@kubera.io') {
            console.log('\n🔄 Retrying with admin@gmail.com...');
            await testLoginFallback();
        }
    }
}

async function testLoginFallback() {
    const baseURL = 'http://localhost:5000';
    const credentials = {
        email: 'admin@gmail.com',
        password: 'admin123'
    };

    try {
        console.log(`🔑 Attempting login with ${credentials.email}...`);
        const response = await axios.post(`${baseURL}/api/auth/login`, credentials);

        if (response.data.token) {
            console.log('✅ Login Successful!');
            console.log('Token received:', response.data.token.substring(0, 20) + '...');
            console.log('User Role:', response.data.user.role);
        }
    } catch (error) {
        console.log('❌ Login failed for fallback as well.');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        }
    }
}

testLogin();
