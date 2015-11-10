'use strict';

const express = require('express');

const app = express();

app.use(express.static('public'));

var server = app.listen(3001, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

