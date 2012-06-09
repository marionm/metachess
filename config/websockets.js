var handlers = require('../controllers/websockets');

module.exports = function(io) {
  io.sockets.on('connection', function(socket) {

    socket.on('move', function(data) {
      handlers.move(io.sockets, data)
    });

  });
};
