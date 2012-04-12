var mongoose = require('mongoose');

var Schema = new mongoose.Schema({
  state: { type: String, default: '7777777789abca98000000000000000000000000000000002345643211111111' },
  turn:  { type: Number, default: 0 }
});

var GameState = mongoose.model('GameState', Schema);

module.exports = {
  model:  GameState,
  schema: Schema
};
