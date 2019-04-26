const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

// cert of 'yingxitech.com'
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.crt'))
};

const PORT = 5000;

const app = express();

// configuration
app.disable('etag');
app.disable('x-powered-by');

app.use(express.static(__dirname + '/build'));

const httpsServer = https.createServer(options, app);

require('./websocket')(httpsServer);
httpsServer.listen(PORT, (e) => console.log(e || `server running on Port: ${PORT}`));