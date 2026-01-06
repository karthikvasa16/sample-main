const axios = require('axios');

async function testGetLeads() {
    try {
        const baseURL = 'http://localhost:5000';

        // 1. Login as admin
        console.log('🔑 Logging in as admin...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin@kubera.io',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Logged in. Token received.');

        // 2. Get Leads
        console.log('📂 Fetching leads...');
        const leadsResponse = await axios.get(`${baseURL}/api/leads`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(`✅ Success! Fetched ${leadsResponse.data.total} leads.`);
        console.log('First lead:', leadsResponse.data.leads[0]);

    } catch (error) {
        console.error('❌ Error testing /api/leads:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
        process.exit(1);
    }
}

testGetLeads();
