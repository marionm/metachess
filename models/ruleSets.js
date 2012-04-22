var _ = require('underscore');

var GameState = require('./gameState').model;

var Rule     = require('./rule');
var Piece    = require('./piece');
var Position = require('./position');

//TODO: Convert to Mongoose model maybe
var RuleSet = function(rules) {
  this.rules = rules;
};

RuleSet.prototype.validMoves = function(state, piece) {
  return _.reduce(this.rules, function(moves, rule) {
    if(rule.pieceType == piece.type) {
      moves.push.apply(moves, rule.targets(state, piece));
    }
    return moves;
  }, []);
};

RuleSet.prototype.apply = function(state, from, to, extraInfo) {
  var piece = state.pieceAt(from);

  var matchingRules = _.filter(this.rules, function(rule) {
    return rule.matches(state, piece, to);
  });

  if(matchingRules.length < 1) {
    return false;
  }

  //TODO: What if more than one matches?
  var rule = matchingRules[0];

  //TODO: Herein lies the problem with mutating the state in apply - always return new state objects!
  var originalStateString = state.state;
  var newState = rule.apply(state, piece, to, extraInfo);

  //Special state info for castling, pretty hacky and ugly
  //TODO: Make this better, it and its helpers suck

  var kingPos = GameState.originalPosition('king', piece.color);
  if(newState.state[kingPos.index] != originalStateString[kingPos.index]) {
    newState.setPieceMoved('king', piece.color);
  }

  var leftRookPos = GameState.originalPosition('rook', piece.color, 'left');
  if(newState.state[leftRookPos.index] != originalStateString[leftRookPos.index]) {
    newState.setPieceMoved('rook', piece.color, 'left');
  }

  var rightRookPos = GameState.originalPosition('rook', piece.color, 'right');
  if(newState.state[rightRookPos.index] != originalStateString[rightRookPos.index]) {
    newState.setPieceMoved('rook', piece.color, 'right');
  }

  for(var i = 0; i < 6; i++) {
    newState.piecesMoved[i] = newState.piecesMoved[i] || state.piecesMoved[i];
  }

  return newState;
};



var standard = [];

standard.push(new Rule(standard.length, 'pawn', {
  targeter: function(state, piece) {
    var moves = [];

    var forward1 = piece.position.forward(piece);
    if(forward1.onBoard() && !state.pieceAt(forward1)) {
      moves.push(forward1);
    };

    var attack1 = piece.position.forwardLeft(piece);
    if(attack1.onBoard() && state.enemyAt(piece, attack1)) {
      moves.push(attack1);
    };

    var attack2 = piece.position.forwardRight(piece);
    if(attack2.onBoard() && state.enemyAt(piece, attack2)) {
      moves.push(attack2);
    };

    return moves;
  },
  applicators: [
    Rule.defaultApplicator,
    function(state, piece, to, extraInfo) {
      extraInfo = extraInfo || {};

      var lastRow = piece.color == 'white' ? 1 : 8;
      if(to.row == lastRow) {
        var type = extraInfo.promoteTo || 'queen';
        state.setPieceAt(Piece.create(type, piece.color), to);
      }

      return state;
    }
  ]
}));

standard.push(new Rule(standard.length, 'pawn', {
  targeter: function(state, piece) {
    var startingRow = piece.color == 'white' ? 7 : 2;
    if(piece.position.row == startingRow) {
      var forward1 = piece.position.forward(piece);
      var forward2 = piece.position.forward(piece, 2);
      return state.pieceAt(forward1) || state.pieceAt(forward2) ? [] : [forward2];
    } else {
      return [];
    }
  }
}));

standard.push(new Rule(standard.length, 'pawn', {
  targeter: function(state, piece) {
    var move = state.previousMove[0];
    if(move && move.type == 'pawn') {
      var pawn = Piece.create(move.type, move.color);
      var from = new Position(move.from);
      var to   = new Position(move.to);

      if(from.forward(pawn, 2).index == to.index) {
        var left  = to.left(pawn);
        var right = to.right(pawn);

        if(
          (left.onBoard  && left.index == piece.position.index) ||
          (right.onBoard && right.index == piece.position.index)
        ) {
          return [to.backward(pawn)];
        }
      }
    }
    return [];
  },
  applicators: [
    Rule.defaultApplicator,
    function(state, piece, to) {
      state.setPieceAt(null, to.backward(piece));
      return state;
    }
  ]
}));

standard.push(new Rule(standard.length, 'rook', {
  targeter: function(state, piece) {
    var directions = ['forward', 'backward', 'left', 'right'];
    return Rule.validDirectionalMoves(state, piece, directions, true);
  }
}));

standard.push(new Rule(standard.length, 'knight', {
  targeter: function(state, piece) {
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
      pos.backwardRight(piece, 2, 1)
    ];

    _.each(positions, function(position) {
      var otherPiece = state.pieceAt(position);
      if(position.onBoard() && (!otherPiece || piece.enemy(otherPiece))) {
        moves.push(position);
      }
    });

    return moves;
  }
}));

standard.push(new Rule(standard.length, 'bishop', {
  targeter: function(state, piece) {
    var directions = ['forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
    return Rule.validDirectionalMoves(state, piece, directions, true);
  }
}));

standard.push(new Rule(standard.length, 'queen', {
  targeter: function(state, piece) {
    var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
    return Rule.validDirectionalMoves(state, piece, directions, true);
  }
}));

standard.push(new Rule(standard.length, 'king', {
  targeter: function(state, piece) {
    var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
    return Rule.validDirectionalMoves(state, piece, directions, false);
  }
}));

var getOriginalRookPosition = function(color, side) {
  if(color == 'white') {
    var row = 8;
    if(side == 'left') {
      return new Position(row, 1);
    } else {
      return new Position(row, 8);
    }
  } else {
    var row = 1;
    if(side == 'left') {
      return new Position(row, 8);
    } else {
      return new Position(row, 1);
    }
  }
};

var canCastle = function(state, king, side) {
  if(state.pieceMoved('king', king.color)) return false;
  if(state.pieceMoved('rook', king.color, side)) return false;

  //TODO: Implement this or something like it
  // if(king.inCheck()) return false;

  var rookPos = getOriginalRookPosition(king.color, side);
  var rook = state.pieceAt(rookPos);
  if(!rook) return false;

  var kingPos = king.position;
  var count = side == 'left' ? 3 : 2;

  var emptyCells = [];
  var checklessCells = [];
  for(var i = 1; i <= 2; i++) {
    var cell = kingPos[side](king, i);
    emptyCells.push(cell);
    checklessCells.push(cell);
  }

  if((side == 'left' && king.color == 'white') || (side == 'right' && king.color =='black')) {
    emptyCells.push(kingPos[side](king, 3));
  }

  var cellsOccupied = _.any(emptyCells, function(cell) {
    return state.pieceAt(cell);
  });
  if(cellsOccupied) return false;

  //TODO: Implement this or something like it
  //      Should actually get second cell-check for free, should be able to just do the cell one over
  // var cellsInCheck = _.any(checklessCells, function(cell) {
  //   return cell.inCheck(state, turnColor);
  // });
  // if(cellsInCheck) return false;

  return true;
};

standard.push(new Rule(standard.length, 'king', {
  targeter: function(state, piece) {
    var moves = [];

    _.each(['left', 'right'], function(side) {
      if(canCastle(state, piece, side)) {
        moves.push(piece.position[side](piece, 2));
      }
    });

    return moves;
  },
  applicators: [
    Rule.defaultApplicator,
    function(state, piece, to) {
      var side, rookTo;
      if(to.right(piece, 2).index == piece.position.index) {
        side = 'left';
        rookTo = to.right(piece, 1);
      } else {
        side = 'right';
        rookTo = to.left(piece, 1);
      }

      var rookPos = GameState.originalPosition('rook', piece.color, side);
      var rook = state.pieceAt(rookPos);
      state.movePiece(rook, rookTo);

      return state;
    }
  ]
}));

//TODO: Need general rule that checks for check states to force player to block, and prevents putting self in check state
//        So, should actually calculate valid moves for both colors, and ensure the opponent has no valid moves into the king's position
//      Perhaps this would make more sense in GameState?

module.exports = {
  model:    RuleSet,
  standard: new RuleSet(standard)
};
