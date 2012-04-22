var _ = require('underscore');

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

  return rule.apply(state, piece, to, extraInfo);
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

//TODO: Need castling rule
//      Since this requires that the king has not yet moved, need to check state history
//      This requires that these methods have access to:
//        a) The game object, or
//        b) Just all previous states (without the game object)
//        c) Just store whether or not the king has moved on each state
//           Seems like there are not many good cases for actually having full state history here, so this is simple and easy

//TODO: Need general rule that checks for check states to force player to block, and prevents putting self in check state


module.exports = {
  model:    RuleSet,
  standard: new RuleSet(standard)
};
