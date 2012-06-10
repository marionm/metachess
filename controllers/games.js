var Game = require('../models/game').model;
var GameState = require('../models/gameState').model;
var GameCounter = require('../models/gameCounter');

var show = function(req, res, game) {
  res.render('games/show', {
    stylesheets: ['compiled/board'],
    scripts:     ['socket.io', 'game'],
    game:        game
  });
}

exports.index = function(req, res) {
  Game.find({}, function(err, games) {
    res.render('games/index', {games: games});
  });
}

exports.show = function(req, res) {
  Game.find({ number: req.params.id }, function(err, games) {
    show(req, res, games[0]);
  });
}

exports.create = function(req, res) {
  GameCounter.next(function(gameId) {
    var game = new Game({
      number: gameId
    });
    game.save(function() {
      res.redirect('/games/' + gameId);
    });
  });
}
