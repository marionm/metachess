var _ = require('underscore');

var GameState = require('../gameState').model;

var RuleSet  = require('../ruleSet');
var Rule     = require('../rule');
var Piece    = require('../piece');
var Position = require('../position');

var rules = [];



//Standard pawn movement

var pawnTargeter = function(state, piece) {
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
};

var pawnPromotionApplicator = function(state, piece, to, extraInfo) {
  extraInfo = extraInfo || {};

  var lastRow = piece.color == 'white' ? 1 : 8;
  if(to.row == lastRow) {
    var type = extraInfo.promoteTo || 'queen';
    state.setPieceAt(Piece.create(type, piece.color), to);
  }

  return state;
};

rules.push(new Rule(rules.length, 'Standard pawn movement', 'pawn', {
  targeter:    pawnTargeter,
  applicators: [
    Rule.defaultApplicator,
    pawnPromotionApplicator
  ]
}));



//First pawn movement

var pawnFirstMoveTargeter = function(state, piece) {
  var startingRow = piece.color == 'white' ? 7 : 2;
  if(piece.position.row == startingRow) {
    var forward1 = piece.position.forward(piece);
    var forward2 = piece.position.forward(piece, 2);
    return state.pieceAt(forward1) || state.pieceAt(forward2) ? [] : [forward2];
  } else {
    return [];
  }
};

rules.push(new Rule(rules.length, 'Standard pawn first move', 'pawn', {
  targeter: pawnFirstMoveTargeter
}));



//En passant

var enPassantTargeter = function(state, piece) {
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
};

var enPassantCaptureApplicator = function(state, piece, to) {
  state.setPieceAt(null, to.backward(piece));
  return state;
};

rules.push(new Rule(rules.length, 'En Passant', 'pawn', {
  targeter: enPassantTargeter,
  applicators: [
    Rule.defaultApplicator,
    enPassantCaptureApplicator
  ]
}));



//Standard rook movement

var rookTargeter = function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right'];
  return Rule.validDirectionalMoves(state, piece, directions, true);
};

rules.push(new Rule(rules.length, 'Standard rook movement', 'rook', {
  targeter: rookTargeter
}));



//Standard knight movement

var knightTargeterNoBoardCheck = function(state, piece) {
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
    if(!otherPiece || piece.enemy(otherPiece)) {
      moves.push(position);
    }
  });

  return moves;
};

var knightTargeter = function(state, piece) {
  return _.filter(knightTargeterNoBoardCheck(state, piece), function(position) {
    return position.onBoard();
  });
};

rules.push(new Rule(rules.length, 'Standard knight movement', 'knight', {
  targeter: knightTargeter
}));



//Standard bishop movement

var bishopTargeter = function(state, piece) {
  var directions = ['forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return Rule.validDirectionalMoves(state, piece, directions, true);
};

rules.push(new Rule(rules.length, 'Standard bishop movement', 'bishop', {
  targeter: bishopTargeter
}));



//Standard queen movement

var queenTargeter = function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return Rule.validDirectionalMoves(state, piece, directions, true);
};

rules.push(new Rule(rules.length, 'Standard queen movement', 'queen', {
  targeter: queenTargeter
}));



//Standard king movement

var kingTargeter = function(state, piece) {
  var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
  return Rule.validDirectionalMoves(state, piece, directions, false);
};

rules.push(new Rule(rules.length, 'Standard king movement', 'king', {
  targeter: kingTargeter
}));



//Castling

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

var canCastle = function(state, king, side, allowCheckStates) {
  if(state.pieceMoved('king', king.color)) return false;
  if(state.pieceMoved('rook', king.color, side)) return false;

  var rookPos = getOriginalRookPosition(king.color, side);
  var rook = state.pieceAt(rookPos);
  if(!rook) return false;

  var kingPos = king.position;
  var count = side == 'left' ? 3 : 2;

  var emptyCells = [];
  for(var i = 1; i <= 2; i++) {
    var cell = kingPos[side](king, i);
    emptyCells.push(cell);
  }
  if((side == 'left' && king.color == 'white') || (side == 'right' && king.color =='black')) {
    emptyCells.push(kingPos[side](king, 3));
  }

  var cellsOccupied = _.any(emptyCells, function(cell) {
    return state.pieceAt(cell);
  });
  if(cellsOccupied) return false;

  if(!allowCheckStates) {
    if(state.inCheck(king.color)) return false;

    var intermediateCell = kingPos[side](king);
    var intermediateState = state.clone().movePiece(king, intermediateCell);
    if(intermediateState.inCheck(king.color)) return false;
  }

  return true;
};

//TODO: Signature is a hack, clean up if possible
var castlingTargeter = function(state, piece, allowCheckStates) {
  var moves = [];

  _.each(['left', 'right'], function(side) {
    if(canCastle(state, piece, side, allowCheckStates)) {
      moves.push(piece.position[side](piece, 2));
    }
  });

  return moves;
};

var castlingApplicator = function(state, piece, to) {
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
};

rules.push(new Rule(rules.length, 'Castling', 'king', {
  targeter: castlingTargeter,
  applicators: [
    Rule.defaultApplicator,
    castlingApplicator
  ]
}));



module.exports = {
  ruleSet: new RuleSet('Standard', rules),
  pawn: {
    targeter:                   pawnTargeter,
    promotionApplicator:        pawnPromotionApplicator,
    firstMoveTargeter:          pawnFirstMoveTargeter,
    enPassantTargeter:          enPassantTargeter,
    enPassantCaptureApplicator: enPassantCaptureApplicator
  },
  rook: {
    targeter: rookTargeter
  },
  knight: {
    targeter:             knightTargeter,
    noBoardCheckTargeter: knightTargeterNoBoardCheck
  },
  bishop: {
    targeter: bishopTargeter
  },
  queen: {
    targeter: queenTargeter
  },
  king: {
    targeter:           kingTargeter,
    castlingTargeter:   castlingTargeter,
    castlingApplicator: castlingApplicator
  }
}
