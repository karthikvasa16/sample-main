const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

const { sequelize, User, LoanApplication, StudentDocument } = require('./models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function verifyBackendLogic() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        // Create Test Student
        const email = `teststudent_${Date.now()}@example.com`;
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            name: 'Test Student',
            email: email,
            password: hashedPassword,
            role: 'student',
            emailVerified: true
        });
        console.log(`✅ Created user: ${user.email} (ID: ${user.id})`);

        // JWT Generation
        const token = jwt.sign({ id: user.id, email: user.email, role: 'student' }, process.env.JWT_SECRET || 'your_jwt_secret');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const apiPost = async (endpoint, body) => {
            const res = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            return data;
        };

        // 1. Test Limits - 0 loans
        const loans0 = await LoanApplication.findAll({ where: { userId: user.id } });
        console.log(`Current loans: ${loans0.length}`);

        // API: Apply Loan 1
        console.log('\n--- Testing 1st Application ---');
        try {
            await apiPost('/loans/apply', {
                amount: 100000,
                purpose: 'Education',
                duration: 12,
                cibilScore: 750,
                pan: 'ABCDE1234F',
                universityName: 'Test Uni',
                course: 'Test Course'
            });
            console.log('✅ Loan 1 applied successfully');
        } catch (e) {
            console.error('❌ Loan 1 failed:', e.message);
        }

        // API: Apply Loan 2 (Should Fail - No Docs)
        console.log('\n--- Testing 2nd Application (No Docs) ---');
        try {
            await apiPost('/loans/apply', {
                amount: 200000,
                purpose: 'Education',
                duration: 24,
                cibilScore: 750,
                pan: 'ABCDE1234F',
                universityName: 'Test Uni 2',
                course: 'Test Course 2'
            });
            console.error('❌ Loan 2 should have failed but succeeded');
        } catch (e) {
            console.log('✅ Loan 2 failed as expected:', e.message);
        }

        // Mock Upload Document
        console.log('\n--- Uploading Document ---');
        await StudentDocument.create({
            userId: user.id,
            documentId: 'pan_card',
            category: 'borrower',
            fileName: 'test.pdf',
            filePath: 'uploads/test.pdf',
            status: 'Pending'
        });
        console.log('✅ Document record inserted directly');

        // API: Apply Loan 2 (Should Succeed now)
        console.log('\n--- Testing 2nd Application (With Docs) ---');
        try {
            await apiPost('/loans/apply', {
                amount: 200000,
                purpose: 'Education',
                duration: 24,
                cibilScore: 750,
                pan: 'ABCDE1234F',
                universityName: 'Test Uni 2',
                course: 'Test Course 2'
            });
            console.log('✅ Loan 2 applied successfully');
        } catch (e) {
            console.error('❌ Loan 2 failed:', e.message);
        }

        // API: Apply Loan 3 (Should Fail - Limit 2)
        console.log('\n--- Testing 3rd Application (Limit Check) ---');
        try {
            await apiPost('/loans/apply', {
                amount: 300000,
                purpose: 'Education',
                duration: 36,
                cibilScore: 750,
                pan: 'ABCDE1234F',
                universityName: 'Test Uni 3',
                course: 'Test Course 3'
            });
            console.error('❌ Loan 3 should have failed but succeeded');
        } catch (e) {
            console.log('✅ Loan 3 failed as expected:', e.message);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    } finally {
        await sequelize.close();
    }
}

verifyBackendLogic();
