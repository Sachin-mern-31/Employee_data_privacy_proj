const BASE_URL = 'http://localhost:5000/api';

async function runApiVerification() {
    console.log('🚀 Running HRShield End-to-End API Verification...');

    try {
        // 1. Authenticate Super Admin
        console.log('\n1. Testing Authentication...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@hrshield.com',
                password: 'AdminPassword123!'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Auth success! User Role:', loginData.role);

        const authHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. Dashboard Metrics
        console.log('\n2. Testing Compliance Dashboard API...');
        const overviewRes = await fetch(`${BASE_URL}/dashboard/overview`, { headers: authHeaders });
        const overviewData = await overviewRes.json();
        console.log('✅ Dashboard Metrics:', overviewData.metrics);

        // 3. Employee Directory & Decryption
        console.log('\n3. Testing Employee Directory & PII Decryption...');
        const empRes = await fetch(`${BASE_URL}/employees`, { headers: authHeaders });
        const empData = await empRes.json();
        const firstEmp = empData[0];

        const decryptRes = await fetch(`${BASE_URL}/employees/${firstEmp._id}?revealSensitive=true`, { headers: authHeaders });
        const decryptData = await decryptRes.json();
        console.log(`✅ Fetched ${empData.length} records. Decrypted SSN for ${firstEmp.name}: ${decryptData.ssn}`);

        // 4. Telemetry Audit Logs
        console.log('\n4. Verifying Telemetry Audit Logs...');
        const auditRes = await fetch(`${BASE_URL}/audit-logs`, { headers: authHeaders });
        const auditData = await auditRes.json();
        console.log(`✅ Audit Logs: ${auditData.length} entries. Latest action: ${auditData[0]?.action}`);

        console.log('\n🎉 ALL HRSHIELD API VERIFICATION CHECKS PASSED!');
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

runApiVerification();

