var _ = require('underscore');
var mongoose = require('mongoose');

var Piece = require('./piece');

var Schema = new mongoose.Schema({
  state: { type: String, default: '89abca9877777777000000000000000000000000000000001111111123456432' },
  turn:  { type: Number, default: 0 }
});

Schema.methods.validMoves = function() {
  var moves = {};

  for(var i = 0; i < this.state.length; i++) {
    var turnColor = this.turn % 2 == 0 ? 'white' : 'black';
    var piece = Piece.fromState(this.state, i);
    if(piece && piece.color == turnColor) {
      moves[piece.position.index] = piece.validMoves(this.state);
    };
  }

  return moves;
};

var GameState = mongoose.model('GameState', Schema);

module.exports = {
  model:  GameState,
  schema: Schema
};
