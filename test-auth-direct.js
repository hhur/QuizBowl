const http = require('http');

function testLogin(username, password) {
  const postData = JSON.stringify({
    username: username,
    password: password
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n🔐 Testing login: ${username}`);
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log(`✅ Login successful for ${username}`);
          console.log(`User: ${response.user.name} (${response.user.role})`);
          console.log(`Token: ${response.token.substring(0, 20)}...`);
        } else {
          console.log(`❌ Login failed for ${username}: ${response.error}`);
        }
      } catch (err) {
        console.log(`❌ Invalid response: ${data}`);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Request failed for ${username}: ${err.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🧪 Testing QuizBowlHub Authentication...');

// Test all demo accounts
setTimeout(() => testLogin('admin', 'admin123'), 100);
setTimeout(() => testLogin('student1', 'student123'), 200);
setTimeout(() => testLogin('coach1', 'coach123'), 300);

// Test invalid credentials
setTimeout(() => testLogin('admin', 'wrongpassword'), 400);
setTimeout(() => testLogin('nonexistent', 'password'), 500);