var GameState = require('./gameState').model

var Rule = function(id, pieceType, targeter, matcher, postApply) {
  this.id = id;
  this.pieceType = pieceType;

  //function(state, piece)
  this.targeter = targeter;

  //function(state, piece, to)
  this.match = matcher || function(state, piece, to) {
    if(piece.type != pieceType) return false;

    var targets = this.target(state, piece);
    return _.any(targets, function(target) {
      return target.index == to.index;
    });
  };

  //function(state, newStateString, piece, to)
  this.postApply = postApply;
};

Rule.prototype.target = function(state, piece) {
  var targetPos = targeter(state, piece);
  return targetPos && targetPos.onBaord() ? targetPos.index : null;
};

Rule.prototype.apply = function(state, piece, to) {
  var stateString = state.state;

  var i1, i2, p1, p2;
  var pieceCode = state[piece.position.index];

  if(piece.position.index < to.index) {
    i1 = piece.position.index;
    i2 = to.index;
    p1 = '0';
    p2 = pieceCode;
  } else {
    i1 = to.index;
    i2 = piece.position.index;
    p1 = pieceCode;
    p2 = '0';
  }

  var newState = stateString.substr(0, i1) +
    p1 + stateString.substr(i1 + 1, i2 - i1 - 1) +
    p2 + stateString.substr(i2 + 1, 64 - i2);

  if(this.postApply) {
    newState = this.postApply(state, newStateString, piece, to);
  }

  return new GameState({
    state: newState,
    turn:  state.turn + 1
  });
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

      var piece = state.pieceAt(position);
      if(!piece || that.enemy(piece)) {
        moves.push(position.index);
      }

      if(piece) {
        done = true;
      }
    });
  });

  return moves;
};

module.exports = Rule;
