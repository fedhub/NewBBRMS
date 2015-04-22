var express    = require("express");
var app        = express();
var server     = require('http').createServer(app);
var io         = require('socket.io').listen(server);
var path       = require('path');
var bodyParser = require('body-parser');

var port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log("app http ready on port "+port);
});