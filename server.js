const express = require('express');

const app = express();

app.use(express.static(__dirname + '/build'));
app.listen(3000, (e) => console.log(e || 'server running on Port: 3000'));