var _ = require('underscore');
var Position = require('./position');

var Piece = function(code, type, color, indexOrRow, col) {
  this.code = code;
  this.type = type;
  this.color = color;
  this.position = new Position(indexOrRow, col);
};

Piece.create = function(type, color) {
  var code = Piece.codeFromTypeAndColor(type, color)
  return new Piece(code, type, color);
};

Piece.typeFromCode = function(code) {
  if(code > 6) {
    code -= 6;
  }

  switch(code) {
    case 1:  return 'pawn';
    case 2:  return 'rook';
    case 3:  return 'knight';
    case 4:  return 'bishop';
    case 5:  return 'queen';
    case 6:  return 'king';
    default: return null;
  }
};

Piece.colorFromCode = function(code) {
  return code <= 6 ? 'white' : 'black';
};

Piece.codeFromTypeAndColor = function(type, color) {
  var code = color == 'white' ? 0 : 6;
  switch(type) {
    case 'pawn'  : return code + 1;
    case 'rook'  : return code + 2;
    case 'knight': return code + 3;
    case 'bishop': return code + 4;
    case 'queen' : return code + 5;
    case 'king'  : return code + 6;
    default      : return null;
  };
};

Piece.fromState = function(state, index) {
  var code = parseInt(state.state[index], 16);
  if(code == 0) return null;

  var type = Piece.typeFromCode(code);
  var color = Piece.colorFromCode(code);

  return new Piece(code, type, color, index);
};

Piece.prototype.enemy = function(piece) {
  return piece && piece.color != this.color;
}

Piece.prototype.friend = function(piece) {
  return piece && piece.color == this.color;
}

module.exports = Piece;
