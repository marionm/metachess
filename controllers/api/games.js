var _ = require('underscore');

var Game      = require('../../models/game').model;
var GameState = require('../../models/gameState').model;

var Position = require('../../models/position')
var RuleSets = require('../../models/ruleSets');

exports.show = function(req, res) {
  Game.findById(req.params.gameId, function(err, game) {
    var json = game.toJSON();
    var currentState = _.last(json.states);
    currentState.validMoves = game.currentState().validMoves();
    res.send(json);
  });
};

exports.move = function(req, res) {
  Game.findById(req.params.gameId, function(err, game) {
    var state = game.currentState();

    var from = new Position(req.body.from);
    var to   = new Position(req.body.to);

    var ruleSet = RuleSets.standard();
    var newState = ruleSet.apply(state, from, to);

    if(!newState) {
      //TODO: Real errors, please
      res.send('nope');
      return;
    }

    //TODO: Push this into the model
    var newStateJson = newState.toJSON();
    stateJson.validMoves = newState.validMoves();

    var response = {
      gameState: stateJson,
      move: {
        from: from.index,
        to:   to.index
      }
    };

    game.states.push(newState);
    game.save(function(err, game) {
      //TODO: Handle errors
      res.send(response);
    });

  });

}
