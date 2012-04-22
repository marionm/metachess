var _ = require('underscore');

var GameState = require('./gameState').model

var defaultApplicator = function(state, piece, to, extraInfo) {
  return state.movePiece(piece, to);
};

var Rule = function(id, pieceType, functions) {
  this.id = id;
  this.pieceType = pieceType;

  functions = functions || {};

  //function(state, piece) -> [positions]
  this.targets = functions.targeter;

  //function(state, piece, to) -> boolean
  this.matches = functions.matcher || function(state, piece, to) {
    if(piece.type != pieceType) return false;

    var targets = this.targets(state, piece);
    return _.any(targets, function(target) {
      return target.index == to.index;
    });
  };

  //Array of function(state, piece, to, extraInfo) -> state
  var applicators = [functions.applicators || functions.applicator];
  applicators = _.compact(_.flatten(applicators));
  if(applicators.length == 0) {
    applicators.push(defaultApplicator);
  }
  this.applicators = applicators;
};

Rule.defaultApplicator = defaultApplicator;

Rule.prototype.apply = function(state, piece, to, extraInfo) {
  var turn = state.turn;

  newState = _.reduce(this.applicators, function(state, applicator) {
    return applicator(state, piece, to, extraInfo);
  }, state);

  newState.turn = turn + 1;

  newState.previousMove = {
    type:  piece.type,
    color: piece.color,
    from:  piece.position.index,
    to:    to.index
  };

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

      if(otherPiece) {
        done = true;
      }
    });
  });

  return moves;
};

module.exports = Rule;
