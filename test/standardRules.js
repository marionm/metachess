var _ = require('underscore');

var GameState = require('../models/gameState').model;
var ruleSets = require('../models/ruleSets');
var Position = require('../models/position');

var assertHasMoves = function(assert, validMoves, from, tos) {
  var moves = validMoves[from.index];
  assert.isDefined(moves);

  _.each(_.flatten([tos]), function(to) {
    assert.includes(moves, to.index);
  });
};

var assertMissingMoves = function(assert, validMoves, from, tos) {
  var moves = validMoves[from.index];
  if(moves) {
    _.each(_.flatten([tos]), function(to) {
      if(_.find(moves, function(move) { move == to.index; })) {
        assert.ok(false, 'Expected not to find move from ' + from.index + ' to ' + to.index);
      }
    });
  }
};

exports.testPawnForward1 = function(beforeExit, assert) {
  var state = new GameState({
    turn: 0,
    state: '\
89abca98\
70777777\
00000000\
07000000\
01000000\
00000000\
10111111\
23456432\
'});
  var moves = state.validMoves(ruleSets.standard);

  assertHasMoves(assert, moves, new Position(7, 7), new Position(6, 7));
  assertMissingMoves(assert, moves, new Position(5, 2), new Position(4, 2));

  state.turn = 1;
  moves = state.validMoves(ruleSets.standard);

  assertHasMoves(assert, moves, new Position(2, 7), new Position(3, 7));
  assertMissingMoves(assert, moves, new Position(4, 2), new Position(5, 2));
};

exports.testPawnForward2 = function(beforeExit, assert) {
  var state = new GameState({
    turn: 0,
    state: '\
89abca98\
77077707\
00000070\
00000100\
00700000\
01000000\
10111011\
23456432\
'});
  var moves = state.validMoves(ruleSets.standard);

  assertHasMoves(assert, moves, new Position(7, 1), new Position(5, 1));
  assertMissingMoves(assert, moves, new Position(6, 2), new Position(4, 2));
  assertMissingMoves(assert, moves, new Position(7, 3), new Position(5, 3));

  state.turn = 1;
  moves = state.validMoves(ruleSets.standard);

  assertHasMoves(assert, moves, new Position(2, 8), new Position(4, 8));
  assertMissingMoves(assert, moves, new Position(3, 7), new Position(5, 7));
  assertMissingMoves(assert, moves, new Position(2, 6), new Position(4, 6));
};

exports.testPawnAttack = function(beforeExit, assert) {
  var state = new GameState({
    turn: 0,
    state: '\
89abca98\
70777770\
00000070\
07070007\
10100010\
00000000\
01011101\
23456432\
'});
  var moves = state.validMoves(ruleSets.standard);

  assertHasMoves(assert, moves, new Position(5, 1), new Position(4, 2));
  assertHasMoves(assert, moves, new Position(5, 3), new Position(4, 2));
  assertHasMoves(assert, moves, new Position(5, 3), new Position(4, 4));
  assertMissingMoves(assert, moves, new Position(5, 1), new Position(4, 8));

  state.turn = 1;
  moves = state.validMoves(ruleSets.standard);

  assertHasMoves(assert, moves, new Position(4, 2), new Position(5, 1));
  assertHasMoves(assert, moves, new Position(4, 2), new Position(5, 3));
  assertHasMoves(assert, moves, new Position(4, 8), new Position(5, 7));
  assertMissingMoves(assert, moves, new Position(4, 8), new Position(5, 1));
};
