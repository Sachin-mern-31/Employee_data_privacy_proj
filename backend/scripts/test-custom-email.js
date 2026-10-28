const BASE_URL = 'http://localhost:5000/api';

async function testCustomEmail() {
    console.log('Testing custom email registration and login...');
    try {
        // Register new user with custom email
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Sachin User',
                email: 'sachin@gmail.com',
                password: 'password123',
                role: 'EMPLOYEE'
            })
        });

        const regData = await regRes.json();
        console.log('Registration Response Status:', regRes.status);
        console.log('Registration Response Data:', regData);

        // Login with newly registered email
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'sachin@gmail.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        console.log('Login Response Status:', loginRes.status);
        console.log('Login Response Data:', loginData);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testCustomEmail();
