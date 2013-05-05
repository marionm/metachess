var _ = require('underscore');

var GameState = require('./gameState').model

var defaultApplicator = function(state, piece, to, extraInfo) {
  return state.movePiece(piece, to);
};

var Rule = function(id, description, pieceType, functions, standard) {
  this.id = id;
  this.pieceType = pieceType;
  this.standard = standard || false;

  if(typeof description == 'string') {
    this.description = description;
  } else {
    this.description = description.effect;
    this.condition = description.condition;
    this.effect = description.detailed || description.effect;
  }

  functions = functions || {};

  //function(state, piece) -> [positions]
  this.targets = functions.targeter;

  //function(state, piece, to) -> boolean
  this.matches = functions.matcher || function(state, piece, to) {
    if(piece.type != pieceType) return false;

    var targets = this.targets(state, piece);
    return _.any(targets, function(target) {
      return target.index == to.index;
    });
  };

  //Array of function(state, piece, to, extraInfo) -> state
  var applicators = [functions.applicators || functions.applicator];
  applicators = _.compact(_.flatten(applicators));
  if(applicators.length == 0) {
    applicators.push(defaultApplicator);
  }
  this.applicators = applicators;

  //function(state) -> boolean
  this.enabledForState = functions.enabler || function() {
    return true;
  };
};

Rule.defaultApplicator = defaultApplicator;

Rule.noBoardCheckTargeter = function(state, piece, positions) {
  var moves = [];
  var pos = piece.position;
  _.each(positions, function(position) {
    var otherPiece = state.pieceAt(position);
    if(!otherPiece || piece.enemy(otherPiece)) {
      moves.push(position);
    }
  });
  return moves;
};

Rule.prototype.apply = function(state, piece, to, extraInfo) {
  var turn = state.turn;

  var newState = _.reduce(this.applicators, function(reducingState, applicator) {
    return applicator(reducingState, piece, to, extraInfo);
  }, state.clone());

  newState.turn = turn + 1;

  newState.previousMove = {
    type:  piece.type,
    color: piece.color,
    from:  piece.position.index,
    to:    to.index
  };

  return newState;
};

Rule.prototype.isEnabled = function(state) {
  return this.enabledForState(state);
}

Rule.prototype.toJSON = function() {
  var json = {
    id: this.id,
    description: this.description,
    standard: this.standard
  };
  if(this.condition) {
    json.condition = this.condition;
  }
  if(this.effect) {
    json.effect = this.effect;
  }
  return json;
};

Rule.validDirectionalMoves = function(state, piece, directions, continuous) {
  continuous = !!continuous;

  var moves = [];
  var from = piece.position;

  _.each(directions, function(direction) {
    var positions;
    if(continuous) {
      positions = from.continuous(piece, direction);
    } else {
      positions = [from[direction](piece)];
    }

    var done = false;
    _.each(positions, function(position) {
      if(done) return;

      if(!position.onBoard()) {
        done = true;
        return;
      };

      var otherPiece = state.pieceAt(position);
      if(!otherPiece || piece.enemy(otherPiece)) {
        moves.push(position);
      }

      if(otherPiece) {
        done = true;
      }
    });
  });

  return moves;
};

module.exports = Rule;
