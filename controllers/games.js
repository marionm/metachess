var _ = require('underscore');

var Game = require('../models/game').model;
var GameState = require('../models/gameState').model;
var GameCounter = require('../models/gameCounter');
var RuleSets = require('../models/ruleSets');

var show = function(req, res, game) {
  res.render('games/show', {
    stylesheets: ['compiled/board', 'compiled/rules'],
    scripts:     ['socket.io', 'game'],
    game:        game
  });
}

exports.index = function(req, res) {
  Game.find({}, function(err, games) {
    games = _.sortBy(games, function(game) {
      return game.number;
    }).reverse();
    res.render('games/index', {
      games: games,
      ruleSets: RuleSets.ruleSets
    });
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
      number: gameId,
      ruleSetId: req.body.ruleSetId || 'metachess-default'
    });
    game.save(function() {
      res.redirect('/games/' + gameId);
    });
  });
}
