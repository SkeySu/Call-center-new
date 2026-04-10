const http = require('http');

const request = (opts, data) => new Promise((resolve, reject) => {
  const req = http.request(opts, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => resolve({ status: res.statusCode, body }));
  });
  req.on('error', reject);
  if (data) req.write(data);
  req.end();
});

(async () => {
  try {
    const loginData = JSON.stringify({ email: 'debug-admin@local.test', password: 'Debug1234!' });
    const login = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData),
        },
      },
      loginData
    );

    console.log('login', login.status);
    console.log(login.body);

    const token = JSON.parse(login.body).token;
    const bulkData = JSON.stringify([{ name: 'Test', email: 'test@example.com' }]);
    const bulk = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/patients/bulk',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bulkData),
          Authorization: 'Bearer ' + token,
        },
      },
      bulkData
    );

    console.log('bulk', bulk.status);
    console.log(bulk.body);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
