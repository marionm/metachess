var express = require('express');
var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

require('./config/environment.js')(app, express, io);
require('./config/routes.js')(app);
require('./config/websockets.js')(io);

var port = process.env.PORT || 3000;
app.listen(port);
console.log(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
