const http = require('http');

const request = http.request(
  {
    hostname: 'localhost',
    port: process.env.PORT || 3000,
    path: '/__reset-engagement',
    method: 'POST',
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('All views and likes reset to 0.');
        return;
      }
      console.error(`Reset failed (${res.statusCode}): ${body || 'Is the server running?'}`);
      process.exit(1);
    });
  },
);

request.on('error', () => {
  console.error('Reset failed: start the server first with npm start');
  process.exit(1);
});

request.end();
