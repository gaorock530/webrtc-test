const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.crt'))
};



const app = express();

app.use(express.static(__dirname + '/build'));

const httpsServer = https.createServer(options, app);
httpsServer.listen(3000, (e) => console.log(e || 'server running on Port: 3000'));