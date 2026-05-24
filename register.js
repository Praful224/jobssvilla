const http = require('http');

const data = JSON.stringify({
  name: 'praful',
  email: 'praful@gmail.com',
  password: '123456'
});

const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    printResult(res.statusCode, body);
  });
});

req.on('error', (error) => {
  console.error('ERROR connecting to backend:', error.message);
});

req.write(data);
req.end();

function printResult(statusCode, body) {
  console.log(`STATUS: ${statusCode}`);
  console.log(`BODY: ${body}`);
}
