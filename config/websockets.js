var handlers = require('../controllers/websockets');

module.exports = function(io) {
  io.sockets.on('connection', function(socket) {

    socket.on('join', function(data) {
      socket.set('gameId', data.gameId, function() {
        handlers.join(io.sockets, socket, data.gameId);
      });
    });

    socket.on('move', function(data) {
      //TODO: Get game ID from request and fail if it does not match the one on the socket
      handlers.move(io.sockets, socket, data);
    });

    socket.on('disconnect', function() {
      //FIXME: How is socket.get supposed to work?
      var gameId = socket.store.data.gameId;
      handlers.leave(io.sockets, socket, gameId);
    });

  });
};
