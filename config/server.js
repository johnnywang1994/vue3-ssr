const path = require('path');
const express = require('express');
const compileServer = require('./compile');

const server = express();

server.use('/.ssr', express.static(path.join(__dirname, '../.ssr')));

compileServer(server);

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`port: ${port}`));
