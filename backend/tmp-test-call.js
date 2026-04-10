const http = require('http');
const data = JSON.stringify({ status: 'Pendiente', notes: 'test' });
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/patients/66e63181-a4a8-43da-9568-4f40caf274b6/call',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    Authorization: 'Bearer test',
  },
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('BODY', body);
  });
});

req.on('error', (err) => {
  console.error('ERROR', err.message);
});

req.write(data);
req.end();
