var _ = require('underscore');
var mongoose = require('mongoose');

var Piece    = require('./piece');
var Position = require('./position');

var MoveSchema = new mongoose.Schema({
  type:  String,
  color: String,
  from:  Number,
  to:    Number
});

var Schema = new mongoose.Schema({
  // This whole godel number thing sounded pure and fun in theory but kind of sucks in practice
  // FIXME: Refactor to a more 'normal' model
  state:        { type: String, default: '89abca9877777777000000000000000000000000000000001111111123456432' },
  turn:         { type: Number, default: 0 },
  previousMove: [MoveSchema],

  //For castling checks
  piecesMoved: [Boolean]
});

var pieceMovedIndex = function(type, color, side) {
  if(type != 'king' && type != 'rook') return -1;

  var index = color == 'white' ? 0 : 1;
  if(type == 'rook') {
    index += side == 'left' ? 2 : 4;
  }

  return index;
};

//Just used for castle state maintenance, not complete enough for use anywhere else
Schema.statics.originalPosition = function(type, color, side) {
  var row, col;
  if(color == 'white') {
    var row = 8;
    if(type == 'king') {
      col = 5;
    } else if(type == 'rook') {
      col = side == 'left' ? 1 : 8;
    }
  } else {
    var row = 1;
    if(type == 'king') {
      col = 5;
    } else if(type == 'rook') {
      col = side == 'left' ? 8 : 1;
    }
  }
  return new Position(row, col);
};

Schema.methods.pieceMoved = function(type, color, side) {
  var index = pieceMovedIndex(type, color, side);
  return this.piecesMoved[index];
};

Schema.methods.setPieceMoved = function(type, color, side) {
  var index = pieceMovedIndex(type, color, side);
  this.piecesMoved[index] = true;
};

Schema.methods.findKing = function(color) {
  return _.find(this.pieces(), function(piece) {
    return piece.type == 'king' && piece.color == color;
  });
};

Schema.methods.inCheck = function(color, ruleSet) {
  ruleSet = ruleSet || this.ruleSet;

  var king = this.findKing(color);

  var enemyColor = color == 'white' ? 'black' : 'white';
  var enemyMoves = this.validMoves(ruleSet, enemyColor, true, true);

  return _.any(enemyMoves, function(moves) {
    return _.any(moves, function(move) {
      return move.index == king.position.index;
    });
  });
};

Schema.methods.validMoves = function(ruleSet, color, allowCheckStates, withoutRuleChanges) {
  //Used later in inCheck method
  //TODO: Ugh, really?
  this.ruleSet = ruleSet;

  var moves = {};

  var state = this;
  var turnColor = color || this.turnColor();

  _.each(this.pieces(), function(piece) {
    if(piece.color == turnColor) {
      var validMoves = ruleSet.validMoves(state, piece, allowCheckStates, withoutRuleChanges);

      validMoves = _.map(validMoves, function(validMove) {
        var move = {
          index: validMove.target.index
        };

        if(!withoutRuleChanges) {
          var getRuleDescription = function(rule) {
            return rule.description;
          };
          move.ruleChanges = {
            added:   _.map(validMove.ruleChanges.added,   getRuleDescription),
            removed: _.map(validMove.ruleChanges.removed, getRuleDescription)
          };
        }

        return move;
      });

      moves[piece.position.index] = validMoves;
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
  var index = parseInt(position.index);

  var code = piece ? piece.code : 0;
  //TODO: Need to push this type of thing into Piece
  code = code.toString(16);

  this.state =
    this.state.substr(0, index) +
    code +
    this.state.substr(index + 1, 64 - index);

  return this;
};

Schema.methods.clone = function() {
  var state = new GameState({
    state: this.state,
    turn:  this.turn,
    previousMove: this.previousMove,
    piecesMoved:  this.piecesMoved
  });

  //TODO: Ugggggh
  state.ruleSet = this.ruleSet;

  return state;
};

var GameState = mongoose.model('GameState', Schema);

module.exports = {
  model:  GameState,
  schema: Schema
};
