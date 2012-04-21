var _ = require('underscore');
var mongoose = require('mongoose');

var Piece = require('./piece');

var Schema = new mongoose.Schema({
  state: { type: String, default: '89abca9877777777000000000000000000000000000000001111111123456432' },
  turn:  { type: Number, default: 0 }
});

Schema.methods.validMoves = function(ruleSet) {
  var moves = {};
  var that = this;
  var turnColor = this.turnColor();

  _.each(this.pieces(), function(piece) {
    if(piece.color == turnColor) {
      var positions = ruleSet.validMoves(that, piece);
      var indexes = _.map(positions, function(position) {
        return position.index;
      });
      moves[piece.position.index] = indexes;
    }
  });

  return moves;
};

Schema.methods.turnColor = function() {
  return this.turn % 2 == 0 ? 'white' : 'black';
};

Schema.methods.pieces = function() {
  var pieces = [];

  for(var i = 0; i < this.state.length; i++) {
    var piece = Piece.fromState(this, i);
    if(piece) {
      pieces.push(piece);
    }
  }

  return pieces;
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

Schema.methods.friendAt = function(piece, position) {
  var otherPiece = this.pieceAt(position);
  return otherPiece && piece.friend(otherPiece);
};

Schema.methods.movePiece = function(piece, to) {
  this.setPieceAt(null, piece.position);
  this.setPieceAt(piece, to);

  return this;
};

Schema.methods.setPieceAt = function(piece, position) {
  var index = position.index;

  var code = piece ? piece.code : 0;
  //TODO: Need to push this type of thing into Piece
  code = code.toString(16);


  this.state =
    this.state.substr(0, index) +
    code +
    this.state.substr(index + 1, 64 - index);

  return this;
};

var GameState = mongoose.model('GameState', Schema);

module.exports = {
  model:  GameState,
  schema: Schema
};
