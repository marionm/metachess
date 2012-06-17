var _ = require('underscore');

//TODO: Collapse?
var games = require('./api/games');

var CurrentPlayer = require('../models/currentPlayer');

exports.move = function(sockets, socket, data) {
  socket.get('currentPlayerId', function(playerId) {
    //TODO: If player Id on request does not match player Id on socket, fail
    games.move(data, function(response) {
      sockets.emit(data.gameId + 'moved', response);
    });
  });
};

exports.join = function(sockets, socket, gameId) {
  CurrentPlayer.next(gameId, function(player) {
    socket.broadcast.emit(gameId + 'playerJoined', { type: player.type });

    CurrentPlayer.find({ gameId: gameId }, function(err, players) {
      var currentPlayers = {
        white: false,
        black: false,
        spectatorCount: 0
      };
      _.each(players, function(p) {
        if(p.type == 'white') {
          currentPlayers.white = true;
        } else if(p.type == 'black') {
          currentPlayers.black = true;
        } else {
          currentPlayers.spectatorCount += 1;
        }
      });

      socket.set('currentPlayerId', player.id, function() {
        socket.emit('joined', {
          player: player,
          currentPlayers: currentPlayers
        });
      });
    });

  });
};

exports.leave = function(sockets, socket, gameId) {
  //FIXME: How is socket.get supposed to work?
  var playerId = socket.store.data.currentPlayerId;
  //FIXME: Can this be done atomically? Look into how mongoose remove works
  CurrentPlayer.findById(playerId, function(err, player) {
    if(player) {
      CurrentPlayer.remove( { _id: playerId }, function(err, count) {
        socket.broadcast.emit(gameId + 'playerLeft', { type: player.type });
      });
    }
  });
};
