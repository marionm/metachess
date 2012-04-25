var _ = require('underscore');

var GameState = require('./gameState').model;

var Rule     = require('./rule');
var Piece    = require('./piece');
var Position = require('./position');

//TODO: Convert to Mongoose model maybe
var RuleSet = function(rules) {
  this.rules = rules;
};

RuleSet.prototype.validMoves = function(state, piece, allowCheckStates) {
  return _.reduce(this.rules, function(moves, rule) {
    if(rule.pieceType == piece.type) {
      var targets = rule.targets(state, piece, allowCheckStates);

      if(!allowCheckStates) {
        targets = _.reject(targets, function(target) {
          var resultingState = rule.apply(state.clone(), piece, target);
          return resultingState.inCheck(piece.color);
        });
      }

      moves.push.apply(moves, targets);
    }
    return moves;
  }, []);
};

var setPieceMoved = function(oldState, newState, pieceType, color, side) {
  var position = GameState.originalPosition(pieceType, color, side);
  var index = position.index;
  if(newState.state[index] != oldState.state[index]) {
    newState.setPieceMoved(pieceType, color, side);
  }
}

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

  var newState = rule.apply(state, piece, to, extraInfo);

  //Special state tracking for castling
  _.each(['white', 'black'], function(color) {
    setPieceMoved(state, newState, 'king', color);
    _.each(['left', 'right'], function(side) {
      setPieceMoved(state, newState, 'rook', color, side);
    });
  });

  return newState;
};



var standard = [];

//Standard pawn movement
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

//Opening pawn movement
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

//En passant
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

//Standard rook movement
standard.push(new Rule(standard.length, 'rook', {
  targeter: function(state, piece) {
    var directions = ['forward', 'backward', 'left', 'right'];
    return Rule.validDirectionalMoves(state, piece, directions, true);
  }
}));

//Standard knight movement
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

//Standard bishop movement
standard.push(new Rule(standard.length, 'bishop', {
  targeter: function(state, piece) {
    var directions = ['forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
    return Rule.validDirectionalMoves(state, piece, directions, true);
  }
}));

//Standard queen movement
standard.push(new Rule(standard.length, 'queen', {
  targeter: function(state, piece) {
    var directions = ['forward', 'backward', 'left', 'right', 'forwardLeft', 'forwardRight', 'backwardLeft', 'backwardRight'];
    return Rule.validDirectionalMoves(state, piece, directions, true);
  }
}));

//Standard king movement
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

//Castling
standard.push(new Rule(standard.length, 'king', {
  //TODO: Signature is a hack, clean up if possible
  targeter: function(state, piece, allowCheckStates) {
    var moves = [];

    _.each(['left', 'right'], function(side) {
      if(canCastle(state, piece, side, allowCheckStates)) {
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

module.exports = {
  model:    RuleSet,
  standard: new RuleSet(standard)
};
