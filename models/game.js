var _ = require('underscore');
var mongoose = require('mongoose');

var GameState = require('./gameState');
var RuleSets  = require('./ruleSets');

var Schema = new mongoose.Schema({
  number: Number,
  ruleSetId: String,
  states: [GameState.schema]
});

Schema.methods.currentState = function() {
  return _.last(this.states);
};

Schema.methods.nextPlayer = function() {
  return this.states.length % 2 == 0 ? 'black' : 'white';
}

Schema.methods.nextPlayerInCheck = function() {
  return this.currentState().inCheck(this.nextPlayer(), this.ruleSet());
}

Schema.methods.ruleSet = function() {
  return RuleSets.get(this.ruleSetId);
};

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
