var _ = require('underscore');

var GameState = require('./gameState').model;

//TODO: Convert to Mongoose model maybe
var RuleSet = function(id, name, rules) {
  this.id = id;
  this.name = name;
  this.rules = rules;
};

var setPieceMoved = function(oldState, newState, pieceType, color, side) {
  var position = GameState.originalPosition(pieceType, color, side);
  var index = position.index;
  if(newState.state[index] != oldState.state[index]) {
    newState.setPieceMoved(pieceType, color, side);
  }
};

RuleSet.prototype.validMoves = function(state, piece, allowCheckStates, withoutRuleChanges) {
  var ruleSet = this;
  var currentRules = ruleSet.enabledRules(state);

  return _.reduce(this.rules, function(validMoves, rule) {
    if(rule.isEnabled(state) && rule.pieceType == piece.type) {
      var moves = [];
      var targets = rule.targets(state, piece, allowCheckStates);
      _.each(targets, function(target) {
        moves.push({ target: target });
      });

      if(!allowCheckStates || !withoutRuleChanges) {
        var statesByTarget = {}
        _.each(moves, function(move) {
          statesByTarget[move.target.index] = rule.apply(state.clone(), piece, move.target);
        });

        if(!allowCheckStates) {
          moves = _.reject(moves, function(move) {
            var inCheck = statesByTarget[move.target.index].inCheck(piece.color);
            return inCheck;
          });
        }

        if(!withoutRuleChanges) {
          moves = _.map(moves, function(move) {
            var targetState = statesByTarget[move.target.index];
            var targetRules = ruleSet.enabledRules(targetState);
            return {
              target:      move.target,
              ruleChanges: ruleSet.ruleChanges(currentRules, targetRules)
            };
          });
        }
      }

      validMoves.push.apply(validMoves, moves);
    }
    return validMoves;
  }, []);
};

RuleSet.prototype.enabledRules = function(state) {
  return _.filter(this.rules, function(rule) {
    return rule.isEnabled(state);
  });
};

RuleSet.prototype.ruleChanges = function(baseRules, targetRules) {
  var getNewRules = function(baseRules, targetRules) {
    baseIds = _.map(baseRules, function(rule) {
      return rule.id;
    });
    return _.filter(targetRules, function(targetRule) {
      return !_.include(baseIds, targetRule.id);
    });
  };

  return {
    added:   getNewRules(baseRules, targetRules),
    removed: getNewRules(targetRules, baseRules)
  }
};

RuleSet.prototype.apply = function(state, from, to, extraInfo) {
  var piece = state.pieceAt(from);

  var matchingRules = _.filter(this.rules, function(rule) {
    return rule.isEnabled(state) && rule.matches(state, piece, to);
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
