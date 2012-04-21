var _ = require('underscore');

var GameState = require('./gameState').model

var Rule = function(id, pieceType, targeter, matcher, applicators) {
  this.id = id;
  this.pieceType = pieceType;

  //function(state, piece) -> [positions]
  this.targets = targeter;

  //function(state, piece, to) -> boolean
  this.matches = matcher || function(state, piece, to) {
    if(piece.type != pieceType) return false;

    var targets = this.targets(state, piece);
    return _.any(targets, function(target) {
      return target.index == to.index;
    });
  };

  //Array of function(state, piece, to) -> state
  applicators = _.compact(_.flatten([applicators]));
  if(applicators.length == 0) {
    applicators.push(function(state, piece, to) {
      return state.movePiece(piece, to);
    });
  }
  this.applicators = applicators;
};

Rule.prototype.apply = function(state, piece, to) {
  var turn = state.turn;

  newState = _.reduce(this.applicators, function(state, applicator) {
    return applicator(state, piece, to);
  }, state);

  newState.turn = turn + 1;
  return newState;
};

Rule.validDirectionalMoves = function(state, piece, directions, continuous) {
  continuous = !!continuous;

  var moves = [];
  var from = piece.position;

  _.each(directions, function(direction) {
    var positions;
    if(continuous) {
      positions = from.continuous(piece, direction);
    } else {
      positions = [from[direction](piece)];
    }

    var done = false;
    _.each(positions, function(position) {
      if(done) return;

      if(!position.onBoard()) {
        done = true;
        return;
      };

      var otherPiece = state.pieceAt(position);
      if(!otherPiece || piece.enemy(otherPiece)) {
        moves.push(position);
      }

      if(piece) {
        done = true;
      }
    });
  });

  return moves;
};

module.exports = Rule;
