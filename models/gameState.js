var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  state: { type: String, default: '2345643211111111000000000000000000000000000000007777777789abca98' },
  turn:  { type: Number, default: 0 }
});

var GameState = mongoose.model('GameState', schema);

module.exports = {
  model:  GameState,
  schema: schema
};
