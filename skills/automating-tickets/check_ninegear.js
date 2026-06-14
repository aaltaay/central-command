const https = require('https');

https.get('https://ninegear.to/tickets/2-new-ticket?id_ticket=1846', (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
});
