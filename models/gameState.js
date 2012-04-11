var mongoose = require('mongoose');

var Schema = new mongoose.Schema({
  state: { type: String, default: '2345643211111111000000000000000000000000000000007777777789abca98' },
  turn:  { type: Number, default: 0 }
});

var GameState = mongoose.model('GameState', Schema);

module.exports = {
  model:  GameState,
  schema: Schema
};
