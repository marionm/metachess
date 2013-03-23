var _ = require('underscore');

var GameState = require('./gameState').model;

//TODO: Convert to Mongoose model maybe
var RuleSet = function(name, rules) {
  this.name = name;
  this.rules = rules;
};

var setPieceMoved = function(oldState, newState, pieceType, color, side) {
  var position = GameState.originalPosition(pieceType, color, side);
  var index = position.index;
  if(newState.state[index] != oldState.state[index]) {
    newState.setPieceMoved(pieceType, color, side);
  }
}

RuleSet.prototype.validMoves = function(state, piece, allowCheckStates) {
  return _.reduce(this.rules, function(moves, rule) {
    if(rule.pieceType == piece.type) {
      var targets = rule.targets(state, piece, allowCheckStates);

      if(!allowCheckStates) {
        targets = _.reject(targets, function(target) {
          var resultingState = rule.apply(state.clone(), piece, target);
          return resultingState.inCheck(piece.color);
        });
      }

      moves.push.apply(moves, targets);
    }
    return moves;
  }, []);
};

RuleSet.prototype.apply = function(state, from, to, extraInfo) {
  var piece = state.pieceAt(from);

  var matchingRules = _.filter(this.rules, function(rule) {
    return rule.matches(state, piece, to);
  });

  if(matchingRules.length < 1) {
    return false;
  }

  //TODO: What if more than one matches?
  var rule = matchingRules[0];

  var newState = rule.apply(state, piece, to, extraInfo);

  //Special state tracking for castling
  _.each(['white', 'black'], function(color) {
    setPieceMoved(state, newState, 'king', color);
    _.each(['left', 'right'], function(side) {
      setPieceMoved(state, newState, 'rook', color, side);
    });
  });

  return newState;
};

module.exports = RuleSet;
