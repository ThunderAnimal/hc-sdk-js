const express = require('express');
const proxy = require('http-proxy-middleware');
const app = express();
const host = '0.0.0.0';
const port = 9090;

app.use('/', express.static('./'));
app.use('/icarus', proxy({
    target: 'http://localhost:8082',
    pathRewrite: {
        '/icarus': '',
    },
    onProxyReq: (proxyReq, req) => {
        console.log(new Date().toLocaleTimeString(), ` └─ ${req.method} ${req.url}`);
    },
}));

app.listen(port, host);

console.log(`Running server at http://${host}:${port}/`);
