var mongoose = require('mongoose');
var GameState = require('./gameState');

var schema = new mongoose.Schema({
  states: [GameState.schema]
});

schema.pre('save', function(next) {
  if(this.states.length == 0) {
    this.states.push(new GameState.model());
  }
  next();
});

var Game = mongoose.model('Game', schema);

module.exports = {
  model:  Game,
  schema: schema
}
