var _ = require('underscore');
var mongoose = require('mongoose');

var GameState = require('./gameState');

var Schema = new mongoose.Schema({
  number: Number,
  states: [GameState.schema]
});

Schema.methods.currentState = function() {
  return _.last(this.states);
};

Schema.methods.nextPlayer = function() {
  return this.states.length % 2 == 0 ? 'black' : 'white';
}

Schema.methods.nextPlayerInCheck = function(ruleSet) {
  return this.currentState().inCheck(this.nextPlayer(), ruleSet);
}

Schema.pre('save', function(next) {
  if(this.states.length == 0) {
    this.states.push(new GameState.model());
  }
  next();
});

var Game = mongoose.model('Game', Schema);

module.exports = {
  model:  Game,
  schema: Schema
}
