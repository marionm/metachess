var _ = require('underscore');
var mongoose = require('mongoose');

var GameState = require('./gameState');

var Schema = new mongoose.Schema({
  states: [GameState.schema]
});

Schema.methods.currentState = function() {
  return _.last(this.states);
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
