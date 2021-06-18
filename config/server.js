import path from 'path';
import express from 'express';
import compileServer from './compile';

const server = express();

server.use('/.ssr', express.static(path.join(__dirname, '../.ssr')));

compileServer(server);

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`port: ${port}`));
