var Game = require('../../models/game').model;
var GameState = require('../../models/gameState').model;

exports.show = function(req, res) {
  Game.findById(req.params.gameId, function(err, game) {
    res.send(game);
  });
};
