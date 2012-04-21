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
  var state = this.state;

  var index1, index2, code1, code2;

  if(piece.position.index < to.index) {
    index1 = piece.position.index;
    index2 = to.index;
    code1 = '0';
    code2 = piece.code;
  } else {
    index1 = to.index;
    index2 = piece.position.index;
    code1 = piece.code;
    code2 = '0';
  }

  var newState = state.substr(0, index1) +
    code1 + state.substr(index1 + 1, index2 - index1 - 1) +
    code2 + state.substr(index2 + 1, 64 - index2);

  return new GameState({
    state: newState,
    turn:  this.turn + 1
  });
};

var GameState = mongoose.model('GameState', Schema);

module.exports = {
  model:  GameState,
  schema: Schema
};
