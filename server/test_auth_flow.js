// Native fetch is available in Node 18+
// Node 18+ has native fetch.

const BASE_URL = 'http://localhost:5000/api/v1/auth';

async function testAuth() {
    console.log('Starting Auth Flow Test...');

    const testUser = {
        username: 'authtestuser_' + Date.now(),
        email: `authtest_${Date.now()}@example.com`,
        password: 'password123'
    };

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${testUser.username}`);
        const registerRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const registerData = await registerRes.json();
        if (!registerRes.ok) {
            throw new Error(`Register failed: ${JSON.stringify(registerData)}`);
        }
        console.log('Register success:', registerData.status);

        // 2. Login
        console.log(`\n2. Logging in...`);
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        }
        console.log('Login success:', loginData.status);

        const accessToken = loginData.token || loginData.data.accessToken;
        console.log('Access Token received:', !!accessToken);

        // Check for Set-Cookie header
        const setCookie = loginRes.headers.get('set-cookie');
        console.log('Set-Cookie header present:', !!setCookie);
        if (setCookie) console.log('Cookie:', setCookie.split(';')[0]);

        // 3. Access Protected Route
        console.log(`\n3. Accessing /me (Protected Route)...`);
        const meRes = await fetch(`${BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const meData = await meRes.json();
        if (!meRes.ok) {
            throw new Error(`Access /me failed: ${JSON.stringify(meData)}`);
        }
        console.log('Access /me success. User ID:', meData.data._id);

    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

testAuth();
