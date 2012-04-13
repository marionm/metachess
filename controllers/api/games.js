var Game = require('../../models/game').model;
var GameState = require('../../models/gameState').model;

exports.show = function(req, res) {
  Game.findById(req.params.gameId, function(err, game) {
    res.send(game);
  });
};

exports.move = function(req, res) {
  Game.findById(req.params.gameId, function(err, game) {
    var body = req.body;

    var currentState = game.currentState();
    var stateString = currentState.state;

    //TODO: Move this stuff somewhere sensible
    var i1, i2, p1, p2;
    if(body.from < body.to) {
      i1 = body.from;
      i2 = body.to;
      p1 = '0';
      p2 = stateString[body.from];
    } else {
      i1 = body.to;
      i2 = body.from;
      p1 = stateString[body.from];
      p2 = '0';
    }

    var newStateString =
      stateString.substr(0, i1) +
      p1 +
      stateString.substr(i1 + 1, i2 - i1 - 1) +
      p2 +
      stateString.substr(i2 + 1, 64 - i2);

    game.states.push(new GameState({
      state: newStateString,
      turn:  currentState.turn + 1
    }));

    game.save(function(err, game) {
      res.send(game);
    });
  });
}
