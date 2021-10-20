'use strict';

const express = require('express');
const logger = require('morgan');
const https = require('https');
const fs = require('fs');

const tlsServerKey = fs.readFileSync('./tls/webserver.key.pem');
const tlsServerCrt = fs.readFileSync('./tls/webserver.crt.pem');

const app = express();

app.use(logger('dev')); // Log requests (GET, POST, ...)

app.get('/', (request, response) => {
    response.send('<h1>Hello Express!</h1>');
});

const httpsOptions = {
    key: tlsServerKey,
    cert: tlsServerCrt,
    requestCert: true,
    ca: caCert
};

const caCert = fs.readFleSync('./tls/cacert.pem')
const server = https.createServer(httpsOptions, app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(443);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);


}
