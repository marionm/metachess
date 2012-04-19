var _ = require('underscore');

var Rule = require('./rule');

//TODO: Convert to Mongoose model maybe
var RuleSet = function(rules) {
  this.rules = rules;
};

RuleSet.prototype.validMoves = function(piece) {
};

RuleSet.prototype.apply = function(state, from, to) {
  var piece = state.pieceAt(from);

  var matchingRules = _.filter(this.rules, function(rule) {
    return rule.match(state, piece, to);
  });

  //TODO: Is this really an error case?
  if(matchingRules.length != 1) {
    return false;
  }

  var rule = matchingRules[0];

  return rule.apply(state, piece, to);
};



var standard = [];

standard.push(new Rule(standard.length, 'pawn', function(state, piece) {
  var moves = [];

  var forward1 = piece.position.forward(piece);
  if(forward1.onBoard() && !state.pieceAt(forward1)) {
    moves.push(forward1.index);
  };

  var attack1 = piece.position.forwardLeft(piece);
  if(attack1.onBoard() && state.enemyAt(piece, attack1)) {
    moves.push(attack1.index);
  };

  var attack2 = piece.position.forwardRight(piece);
  if(attack2.onBoard() && state.enemyAt(piece, attack2)) {
    moves.push(attack2.index);
  };

  return moves;
}));

//TODO: Needs custom matcher and post applicator for en passant
standard.push(new Rule(standard.length, 'pawn', function(state, piece) {
  var startingRow = this.color == 'white' ? 7 : 2;
  if(piece.position.row == startingRow) {
    var pos = piece.position.forward(piece);
    return state.pieceAt(pos) ? [] : [pos];
  } else {
    return [];
  }
}));

//TODO: Need pawn rule for queening

standard.push(new Rule(standard.length, 'rook', function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right'];
  return piece.validDirectionalMoves(state.state, [], directions, true);
}));

standard.push(new Rule(standard.length, 'knight', function(state, piece) {
  var moves = [];

  var pos = piece.position;
  var positions = [
    pos.forwardLeft(  piece, 1, 2),
    pos.forwardLeft(  piece, 2, 1),
    pos.forwardRight( piece, 1, 2),
    pos.forwardRight( piece, 2, 1),
    pos.backwardLeft( piece, 1, 2),
    pos.backwardLeft( piece, 2, 1),
    pos.backwardRight(piece, 1, 2),
    pos.backward(Rightpiece, 2, 1)
  ];

  _.each(positions, function(position) {
    var otherPiece = state.pieceAt(position);
    if(position.onBoard() && (!piece || piece.enemy(otherPiece))) {
      moves.push(position.index);
    }
  });

  return moves;
}));

standard.push(new Rule(standard.length, 'bishop', function(state, piece) {
  var directions = ['forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return piece.validDirectionalMoves(state, piece, directions, true);
}));

standard.push(new Rule(standard.length, 'queen', function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return Rule.validDirectionalMoves(state, piece, directions, true);
}));

standard.push(new Rule(standard.length, 'king', function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return piece.validDirectionalMoves(state, piece, directions, false);
}));

//TODO: Need castling rule



module.exports = {
  model:    RuleSet,
  standard: new RuleSet(standard)
};
