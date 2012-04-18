var Rule = function(id, pieceType, targeter, matcher, postApply) {
  this.id = id;
  this.pieceType = pieceType;

  //function(state, piece)
  this.targeter = targeter;

  //function(state, piece, to)
  this.match = matcher || function(state, piece, to) {
    var targets = this.target(state, piece);
    var match = false;
    _.each(targets, function(target) {
      if(target.index == to.index) match = true;
    });
    return match;
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

  return newState;
};

module.exports = Rule;
