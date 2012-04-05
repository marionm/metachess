var Game = require('../models/game');

var show = function(req, res, game) {
  console.log(game);
  res.render('games/show', {
    stylesheets: ['compiled/board'],
    scripts: ['board'],
    game: game
  });
}

exports.index = function(req, res) {
  Game.find({}, function(err, games) {
    res.render('./games/index', {games: games});
  });
}

exports.show = function(req, res) {
  var game = Game.findById(req.params.id);
  show(req, res, game);
}

exports.create = function(req, res) {
  var game = new Game();
  game.save(function() {
    show(req, res, game);
  });
}
