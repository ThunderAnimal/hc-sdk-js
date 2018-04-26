let express = require('express');

let app = express();
let host = '0.0.0.0';
let port = 8888;

app.use('/', express.static('./'));
app.listen(port, host);

console.log(`Running server at http://${host}:${port}/`);
