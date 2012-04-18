var Rule = require('./rule');

//TODO: Convert to Mongoose model maybe
var RuleSet = functiPersiston(rules) {
  this.rules = rules;
};

RuleSet.prototype.setState = function(state) {
};

RuleSet.prototype.apply = function(piece) {
};

var standard = [];

standard.push(new Rule(standard.length, 'pawn', function(state, piece) {
  var moves = [];

  var forward1 = piece.position.forward(piece.color);
  if(forward1.onBoard() && !Piece.pieceAt(state.state, forward1)) {
    moves.push(forward1.index);
  };

  var attack1 = piece.position.forwardLeft(piece.color);
  if(attack1.onBoard() && Piece.enemyAt(state.state, attack1)) {
    moves.push(attack1.index);
  };

  var attack2 = piece.position.forwardRight(piece.color);
  if(attack2.onBoard() && Piece.enemyAt(state.state, attack2)) {
    moves.push(attack2.index);
  };

  return moves;
});

//TODO: Needs custom matcher and post applicator for en passant
standard.push(new Rule(standard.length, 'pawn', function(state, piece) {
  var startingRow = this.color == 'white' ? 7 : 2;
  if(piece.position.row == startingRow) {
    var pos = piece.position.forward(piece.color);
    return state.pieceAt(pos) ? [] : [pos];
  } else {
    return [];
  }
});

//TODO: Need pawn rule for queening

standard.push(new Rule(standard.length, 'rook', function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right'];
  return piece.validDirectionalMoves(state.state, [], directions, true);
});

standard.push(new Rule(standard.length, 'knight', function(state, piece) {
  var moves = [];

  var pos = piece.position;
  var positions = [
    pos.forward( piece.color, 1).left( piece.color, 2),
    pos.forward( piece.color, 2).left( piece.color, 1),
    pos.forward( piece.color, 1).right(piece.color, 2),
    pos.forward( piece.color, 2).right(piece.color, 1),
    pos.backward(piece.color, 1).left( piece.color, 2),
    pos.backward(piece.color, 2).left( piece.color, 1),
    pos.backward(piece.color, 1).right(piece.color, 2),
    pos.backward(piece.color, 2).right(piece.color, 1)
  ];

  _.each(positions, function(position) {
    var otherPiece = Piece.pieceAt(state.state, position);
    if(position.onBoard() && (!piece || piece.enemy(otherPiece))) {
      moves.push(position.index);
    }
  });

  return moves;
});

standard.push(new Rule(standard.length, 'bishop', function(state, piece) {
  var directions = ['forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return piece.validDirectionalMoves(state.state, [], directions, true);
});

standard.push(new Rule(standard.length, 'queen', function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return piece.validDirectionalMoves(state, [], directions, true);
};

standard.push(new Rule(standard.length, 'king', function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return piece.validDirectionalMoves(state, [], directions, false);
};

module.exports = {
  model:    RuleSet,
  standard: new RuleSet(standard)
};
