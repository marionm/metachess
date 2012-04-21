module.exports = function(env, gameId) {
  env.mongoose = require('mongoose');
  env.mongoose.connect('localhost', 'metachessDev');

  env.u = require('underscore');

  var m = './models/';
  env.Game     = require(m + 'game').model;
  env.Piece    = require(m + 'piece');
  env.Position = require(m + 'position');
  env.ruleSets = require(m + 'ruleSets');

  env.standard = ruleSets.standard;

  if(gameId) {
    Game.findById(gameId, function(err, game) {
      env.game = game;
      env.state = game.currentState();
    });
  }
};
