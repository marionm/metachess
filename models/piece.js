var _ = require('underscore');
var Position = require('./position');

var Piece = function(type, color, indexOrRow, col) {
  this.type = type;
  this.color = color
  this.position = new Position(indexOrRow, col);
};

Piece.fromState = function(state, index) {
  var code = parseInt(state[index], 16);
  if(code == 0) return null;

  var color;
  if(code <= 6) {
    color = 'white';
  } else {
    color = 'black';
    code -= 6;
  }

  var type;
  switch(code) {
    case 1: type = 'pawn';   break;
    case 2: type = 'rook';   break;
    case 3: type = 'knight'; break;
    case 4: type = 'bishop'; break;
    case 5: type = 'queen';  break;
    case 6: type = 'king';   break;
    default: return null;
  }

  return new Piece(type, color, index);
};

Piece.pieceAt = function(state, position) {
  //FIXME: Check that position is on board before using index
  //       So actually, make index a method that returns -1 if not on board
  return Piece.fromState(state, position.index);
};

//FIXME: Move onto GameState
Piece.prototype.enemyAt = function(state, position) {
  var piece = Piece.pieceAt(state, position);
  return piece && this.enemy(piece);
};

Piece.prototype.friendlyAt = function(state, position) {
  var piece = Piece.pieceAt(state, position);
  return piece && this.friendly(piece);
};

Piece.prototype.enemy = function(piece) {
  return this.color != piece.color;
};

Piece.prototype.friendly = function(piece) {
  return this.color = piece.color;
};

//TODO: Unit test the moves
Piece.prototype.validMoves = function(state, rules) {
  //TODO: Should do this from a rule set
  switch(this.type) {
    case 'pawn':   return this.validPawnMoves(state, rules);
    case 'rook':   return this.validRookMoves(state, rules);
    case 'knight': return this.validKnightMoves(state, rules);
    case 'bishop': return this.validBishopMoves(state, rules);
    case 'queen':  return this.validQueenMoves(state, rules);
    case 'king':   return this.validKingMoves(state, rules);
  }
};

Piece.prototype.validPawnMoves = function(state, rules) {
  var forward1 = this.position.forward(this.color);
  var forward2 = this.position.forward(this.color, 2);
  var attack1  = this.position.forwardLeft(this.color);
  var attack2  = this.position.forwardRight(this.color);

  var startingRow = this.color == 'white' ? 7 : 2;

  var moves = [];

  if(forward1.onBoard() && !Piece.pieceAt(state, forward1)) {
    moves.push(forward1.index);
  };

  if(this.position.row == startingRow && !Piece.pieceAt(state, forward2)) {
    moves.push(forward2.index);
  };

  if(attack1.onBoard() && this.enemyAt(state, attack1)) {
    moves.push(attack1.index);
  };

  if(attack2.onBoard() && this.enemyAt(state, attack2)) {
    moves.push(attack2.index);
  };

  return moves;
};

Piece.prototype.validRookMoves = function(state, rules) {
  var directions = ['forward', 'backward', 'left', 'right'];
  return this.validDirectionalMoves(state, rules, directions, true);
};

Piece.prototype.validKnightMoves = function(state, rules) {
  var moves = [];

  var pos = this.position;
  var positions = [
    pos.forward( this.color, 1).left( this.color, 2),
    pos.forward( this.color, 2).left( this.color, 1),
    pos.forward( this.color, 1).right(this.color, 2),
    pos.forward( this.color, 2).right(this.color, 1),
    pos.backward(this.color, 1).left( this.color, 2),
    pos.backward(this.color, 2).left( this.color, 1),
    pos.backward(this.color, 1).right(this.color, 2),
    pos.backward(this.color, 2).right(this.color, 1)
  ];

  var that = this;
  _.each(positions, function(position) {
    var piece = Piece.pieceAt(state, position);
    if(position.onBoard() && (!piece || that.enemy(piece))) {
      moves.push(position.index);
    }
  });

  return moves;
};

Piece.prototype.validBishopMoves = function(state, rules) {
  var directions = ['forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return this.validDirectionalMoves(state, rules, directions, true);
};

Piece.prototype.validQueenMoves = function(state, rules) {
  var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return this.validDirectionalMoves(state, rules, directions, true);
};

Piece.prototype.validKingMoves = function(state, rules) {
  var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return this.validDirectionalMoves(state, rules, directions, false);
};

//FIXME: Doesn't belong here, and the signature is screwy
Piece.prototype.validDirectionalMoves = function(state, rules, directions, continuous) {
  continuous = !!continuous;

  var moves = [];

  var that = this;
  _.each(directions, function(direction) {
    var positions;
    if(continuous) {
      positions = that.position.continuous(direction, that.color);
    } else {
      positions = [that.position[direction](that.color)];
    }

    var done = false;
    _.each(positions, function(position) {
      if(done) return;
      if(!position.onBoard()) {
        done = true;
        return;
      };

      var piece = Piece.pieceAt(state, position);
      if(!piece || that.enemy(piece)) {
        moves.push(position.index);
      }

      if(piece) done = true;
    });
  });

  return moves;
};

module.exports = Piece;
