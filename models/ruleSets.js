var _ = require('underscore');

var Rule  = require('./rule');
var Piece = require('./piece');

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

RuleSet.prototype.apply = function(state, from, to) {
  var piece = state.pieceAt(from);

  var matchingRules = _.filter(this.rules, function(rule) {
    //TODO: Need prior move, for en passant
    //      This means it needs to be either:
    //        a) infered from previous state (potentially complex if non-standard rules are enabled), or
    //        b) provided by the client (and therefore verified)
    return rule.matches(state, piece, to);
  });

  if(matchingRules.length < 1) {
    return false;
  }

  var rule = matchingRules[0];

  return rule.apply(state, piece, to);
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
    function(state, piece, to) {
      var lastRow = piece.color == 'white' ? 1 : 8;
      if(to.row == lastRow) {
        //TODO: The promotion piece needs to be selectable by the user
        var type = 'queen';
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

//TODO: Needs custom matcher and applicator for en passant
//      Since it is only valid on the first turn it is available, need knowledge of the turn that created this state

//TODO: Need pawn rules for promotion
//      How to let the user choose the desired piece? Need something client side - for now, default to queen

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
//      Choice a sounds more flexible and cleaner

//TODO: Need general rule that checks for check states to force player to block, and prevents putting self in check state


module.exports = {
  model:    RuleSet,
  standard: new RuleSet(standard)
};
