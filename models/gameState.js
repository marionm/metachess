var _ = require('underscore');
var mongoose = require('mongoose');

var Piece = require('./piece');

var Schema = new mongoose.Schema({
  state: { type: String, default: '89abca9877777777000000000000000000000000000000001111111123456432' },
  turn:  { type: Number, default: 0 }
});

//FIXME: Belongs in RuleSet, move
Schema.methods.validMoves = function() {
  var moves = {};

  for(var i = 0; i < this.state.length; i++) {
    var turnColor = this.turn % 2 == 0 ? 'white' : 'black';
    var piece = Piece.fromState(this, i);
    if(piece && piece.color == turnColor) {
      moves[piece.position.index] = piece.validMoves(this);
    };
  }

  return moves;
};

Schema.methods.pieceAt = function(position) {
  if(position.onBoard()) {
    return Piece.fromState(this, position.index);
  } else {
    return null;
  }
};

Schema.methods.enemyAt = function(piece, position) {
  var otherPiece = this.pieceAt(position);
  return otherPiece && piece.enemy(otherPiece);
};

Schema.methods.friendlyAt = function(piece, position) {
  var otherPiece = this.pieceAt(position);
  return otherPiece && piece.friendly(otherPiece);
};

var GameState = mongoose.model('GameState', Schema);

module.exports = {
  model:  GameState,
  schema: Schema
};
