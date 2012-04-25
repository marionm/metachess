var _ = require('underscore');

var Game      = require('../../models/game').model;
var GameState = require('../../models/gameState').model;

var Position = require('../../models/position')
var RuleSets = require('../../models/ruleSets');

exports.show = function(req, res) {
  Game.findById(req.params.gameId, function(err, game) {
    var ruleSet = RuleSets.standard;
    var validMoves = game.currentState().validMoves(ruleSet);

    var json = game.toJSON();
    var currentState = _.last(json.states);
    currentState.validMoves = validMoves;

    res.send(json);
  });
};

exports.move = function(req, res) {
  Game.findById(req.params.gameId, function(err, game) {
    var state = game.currentState();

    var from = new Position(req.body.from);
    var to   = new Position(req.body.to);

    var extraInfo = {
      promoteTo: req.body.promoteTo
    };

    var ruleSet = RuleSets.standard;
    //Set ruleSet on the state so it is available in inCheck later, necessary for castling
    //TODO: Ugh, really?
    state.ruleSet = ruleSet;
    var newState = ruleSet.apply(state, from, to, extraInfo);

    if(!newState) {
      //TODO: Real errors, please
      res.send('nope');
      return;
    }

    //TODO: Push this into the model
    var newStateJson = newState.toJSON();
    newStateJson.validMoves = newState.validMoves(ruleSet);

    var response = {
      gameState: newStateJson,
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
