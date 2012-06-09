//TODO: Collapse?
var games = require('./api/games');

exports.move = function(sockets, data) {
  games.move(sockets, data);
};
