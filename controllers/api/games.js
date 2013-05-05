var _ = require('underscore');

var Game      = require('../../models/game').model;
var GameState = require('../../models/gameState').model;

var Position = require('../../models/position')
var RuleSets = require('../../models/ruleSets');

exports.show = function(req, res) {
  Game.findById(req.params.gameId, function(err, game) {
    //var ruleSet = RuleSets.standard;
    var ruleSet = RuleSets.metachessDefault;
    var state = game.currentState();

    var validMoves = state.validMoves(ruleSet);
    var enabledRules = ruleSet.enabledRules(state);

    var json = game.toJSON();
    var currentState = _.last(json.states);
    currentState.nextPlayer = game.nextPlayer();
    currentState.validMoves = validMoves;
    currentState.enabledRules = _.map(enabledRules, function(rule) {
      return rule.toJSON();
    });

    res.send(json);
  });
};

exports.move = function(data, callback) {
  Game.findById(data.gameId, function(err, game) {
    var state = game.currentState();

    var from = new Position(data.from);
    var to   = new Position(data.to);

    var extraInfo = {
      promoteTo: data.promoteTo
    };

    //var ruleSet = RuleSets.standard;
    var ruleSet = RuleSets.metachessDefault;
    //Set ruleSet on the state so it is available in inCheck later, necessary for castling
    //TODO: Ugh, really?
    state.ruleSet = ruleSet;
    var newState = ruleSet.apply(state, from, to, extraInfo);

    if(!newState) {
      //TODO: Real errors, please
      callback('nope');
      return;
    }

    //TODO: Push this into the model
    var newStateJson = newState.toJSON();
    newStateJson.validMoves = newState.validMoves(ruleSet);
    newStateJson.enabledRules = _.map(ruleSet.enabledRules(newState), function(rule) {
      return rule.toJSON();
    });

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
      newStateJson.nextPlayer = game.nextPlayer();
      callback(response);
    });

  });

}
