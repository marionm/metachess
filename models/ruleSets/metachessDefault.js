var _ = require('underscore');

var GameState = require('../gameState').model;

var RuleSet  = require('../ruleSet');
var Rule     = require('../rule');
var Piece    = require('../piece');
var Position = require('../position');

var standard = require('./standard');

// TODO: Change ruleset to allow better access to individual rules
//       That way, one can clone the standard set and modify existing rules
//       instead of needing to redefine the standard rules if one wants
//       a custom (i.e. more restrictive) targeter or applicator for them.
//       For example, see the rook/bishop swap rule

var rules = [];

var whiteBackRow = [];
var blackBackRow = [];
var allCols = [1, 2, 3, 4, 5, 6, 7, 8];
_.each(allCols, function(col) {
  whiteBackRow.push(new Position(1, col));
  blackBackRow.push(new Position(8, col));
});

// TODO: Belongs elsewhere
var pieceAt = function(state, whitePositions, blackPositions, pieceType) {
  var positionsByColor = {
    'white': whitePositions,
    'black': blackPositions
  };

  var found = _.find(positionsByColor, function(positions, color) {
    var found = _.find(positions, function(position) {
      var piece = state.pieceAt(position);
      if(piece && piece.color == color && (!pieceType || piece.type == pieceType)) {
        return true;
      }
    });
    if(found) {
      return true;
    }
  });

  if(found) {
    return true;
  } else {
    return false;
  }
};

// Standard pawn movement

var standardPawnMovementEnabler = function(state) {
  return !reversePawnMovementEnabler(state);
};

rules.push(new Rule(rules.length, 'pawn', {
  enabler: standardPawnMovementEnabler,
  targeter: standard.pawn.targeter,
  applicators: [
    Rule.defaultApplicator,
    standard.pawn.promotionApplicator
  ]
}));

// Reverse pawn movement

// Enabled when a queen is on the back row
var reversePawnMovementEnabler = function(state) {
  return pieceAt(state, whiteBackRow, blackBackRow, 'queen');
};

var reversePawnTargeter = function(state, piece) {
  var moves = [];

  var backward1 = piece.position.backward(piece);
  if(backward1.onBoard() && !state.pieceAt(backward1)) {
    moves.push(backward1);
  };

  var attack1 = piece.position.backwardLeft(piece);
  if(attack1.onBoard() && state.enemyAt(piece, attack1)) {
    moves.push(attack1);
  };

  var attack2 = piece.position.backwardRight(piece);
  if(attack2.onBoard() && state.enemyAt(piece, attack2)) {
    moves.push(attack2);
  };

  return moves;
};

rules.push(new Rule(rules.length, 'pawn', {
  enabler:  reversePawnMovementEnabler,
  targeter: reversePawnTargeter
}));

// First-turn pawn movement

rules.push(new Rule(rules.length, 'pawn', {
  targeter: standard.pawn.firstMoveTargeter
}));

// En passant

rules.push(new Rule(rules.length, 'pawn', {
  targeter: standard.pawn.enPassantTargeter,
  applicators: [
    Rule.defaultApplicator,
    standard.pawn.enPassantCaptureApplicator
  ]
}));



// Standard rook movement

var standardRookMovementEnabler = function(state) {
  return !rookBishopMovementSwapEnabler(state);
};

rules.push(new Rule(rules.length, 'rook', {
  enabler:  standardRookMovementEnabler,
  targeter: standard.rook.targeter
}));

// Standard bishop movement

var standardBishopMovementEnabler = function(state) {
  return !rookBishopMovementSwapEnabler(state);
};

rules.push(new Rule(rules.length, 'bishop', {
  enabler:  standardBishopMovementEnabler,
  targeter: standard.bishop.targeter
}));

// Swapped rook/bishop movement
// Enabled when a king is in one of the center four squares

var rookBishopMovementSwapEnabler = function(state) {
  var positions = [
    new Position(4, 4),
    new Position(4, 5),
    new Position(5, 4),
    new Position(5, 5)
  ];
  return pieceAt(state, positions, positions, 'king');
};

rules.push(new Rule(rules.length, 'rook', {
  enabler:  rookBishopMovementSwapEnabler,
  targeter: standard.bishop.targeter
}));

rules.push(new Rule(rules.length, 'bishop', {
  enabler:  rookBishopMovementSwapEnabler,
  targeter: standard.rook.targeter
}));



// Standard knight movement

var standardKnightEnabler = function(state) {
  return !superKnightEnabler22(state) && !superKnightEnabler31(state)
};

rules.push(new Rule(rules.length, 'knight', {
  enabler:  standardKnightEnabler,
  targeter: standard.knight.targeter
}));

// Super knights (2-2)
// Enabled when a rook is in the back row

var superKnightEnabler22 = function(state) {
  return pieceAt(state, whiteBackRow, blackBackRow, 'rook');
};

var superKnightTargeter22NoBoardCheck = function(state, piece) {
  pos = piece.position;
  var positions = [
    pos.forwardLeft(  piece, 2, 2),
    pos.forwardRight( piece, 2, 2),
    pos.backwardLeft( piece, 2, 2),
    pos.backwardRight(piece, 2, 2)
  ];
  return Rule.noBoardCheckTargeter(state, piece, positions);
};

var superKnightTargeter22 = function(state, piece) {
  var moves = superKnightTargeter22NoBoardCheck(state, piece);
  return _.filter(moves, function(move) {
    return move.onBoard();
  });
};

rules.push(new Rule(rules.length, 'knight', {
  enabler:  superKnightEnabler22,
  targeter: superKnightTargeter22
}));

// Super knights (3-1)
// Enabled when a bishop is in the back row

var superKnightEnabler31 = function(state) {
  return pieceAt(state, whiteBackRow, blackBackRow, 'bishop');
};

var superKnightTargeter31NoBoardCheck = function(state, piece) {
  pos = piece.position;
  var positions = [
    pos.forwardLeft(  piece, 3, 1),
    pos.forwardLeft(  piece, 1, 3),
    pos.forwardRight( piece, 3, 1),
    pos.forwardRight( piece, 1, 3),
    pos.backwardLeft( piece, 3, 1),
    pos.backwardLeft( piece, 1, 3),
    pos.backwardRight(piece, 3, 1),
    pos.backwardRight(piece, 1, 3)
  ];
  return Rule.noBoardCheckTargeter(state, piece, positions);
};

var superKnightTargeter31 = function(state, piece) {
  var moves = superKnightTargeter31NoBoardCheck(state, piece);
  return _.filter(moves, function(move) {
    return move.onBoard();
  });
};

rules.push(new Rule(rules.length, 'knight', {
  enabler:  superKnightEnabler31,
  targeter: superKnightTargeter31
}));

// Wrapping knights
// Enabled when a king is in a corner
// TODO: This seems like a terrible enabler; too easy to get with castling

var wrappingKnightEnabler = function(state) {
  var positions = [
    new Position(1, 1),
    new Position(1, 8),
    new Position(8, 1),
    new Position(8, 8)
  ];
  return pieceAt(state, positions, positions, 'king');
}

var getKnightNoBoardCheckTargeter = function(state) {
  if(superKnightEnabler22(state)) {
    return superKnightTargeter22NoBoardCheck;
  } else if(superKnightEnabler31(state)) {
    return superKnightTargeter31NoBoardCheck;
  } else {
    return standard.knight.noBoardCheckTargeter;
  }
};

var wrappingKnightTargeter = function(state, piece) {
  var targeter = getKnightNoBoardCheckTargeter(state);
  var moves = targeter(state, piece);
  return _.map(moves, function(move) {
    return move.wrap();
  });
};

rules.push(new Rule(rules.length, 'knight', {
  enabler:  wrappingKnightEnabler,
  targeter: wrappingKnightTargeter
}));



//Standard queen movement

var standardQueenMovementEnabler = function(state) {
  return !gimppedQueenMovementEnabler(state);
};

rules.push(new Rule(rules.length, 'queen', {
  enabler:  standardQueenMovementEnabler,
  targeter: standard.queen.targeter
}));

// Gimpped queen movement
// Enabled when a knight is in a side column

var gimppedQueenMovementEnabler = function(state) {
  var sideColumns = [];
  var rows = [1, 2, 3, 4, 5, 6, 7, 8];
  _.each(rows, function(row) {
    sideColumns.push(new Position(row, 1));
    sideColumns.push(new Position(row, 8));
  });
  return pieceAt(state, sideColumns, sideColumns, 'knight');
};

rules.push(new Rule(rules.length, 'queen', {
  enabler:  gimppedQueenMovementEnabler,
  targeter: standard.king.targeter
}));



//Standard king movement

rules.push(new Rule(rules.length, 'king', {
  targeter: standard.king.targeter
}));

rules.push(new Rule(rules.length, 'king', {
  targeter: standard.king.castlingTargeter,
  applicators: [
    Rule.defaultApplicator,
    standard.king.castlingApplicator
  ]
}));



module.exports = {
  ruleSet: new RuleSet('Metachess (default)', rules)
};