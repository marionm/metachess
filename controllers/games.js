var Game = require('../models/game');

var show = function(req, res, game) {
  res.render('games/show', {
    stylesheets: ['compiled/board'],
    scripts: ['board'],
    game: game
  });
}

exports.index = function(req, res) {
  Game.find({}, function(err, games) {
    res.render('games/index', {games: games});
  });
}

exports.show = function(req, res) {
  Game.findById(req.params.id, function(err, game) {
    show(req, res, game);
  });
}

exports.create = function(req, res) {
  var game = new Game();
  game.save(function() {
    res.redirect('/games/' + game.id);
  });
}
