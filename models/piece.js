var _ = require('underscore');
var Position = require('./position');

var Piece = function(code, type, color, indexOrRow, col) {
  this.code = code;
  this.type = type;
  this.color = color
  this.position = new Position(indexOrRow, col);
};

Piece.fromState = function(state, index) {
  var code = parseInt(state.state[index], 16);
  if(code == 0) return null;

  var color;
  var typeCode;
  if(code <= 6) {
    color = 'white';
    typeCode = code;
  } else {
    color = 'black';
    typeCode = code - 6;
  }

  var type;
  switch(typeCode) {
    case 1: type = 'pawn';   break;
    case 2: type = 'rook';   break;
    case 3: type = 'knight'; break;
    case 4: type = 'bishop'; break;
    case 5: type = 'queen';  break;
    case 6: type = 'king';   break;
    default: return null;
  }

  return new Piece(code, type, color, index);
};

Piece.prototype.enemy = function(piece) {
  return piece && piece.color != this.color;
}

Piece.prototype.friend = function(piece) {
  return piece && piece.color == this.color;
}

module.exports = Piece;
