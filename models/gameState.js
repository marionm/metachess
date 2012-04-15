var mongoose = require('mongoose');

var Schema = new mongoose.Schema({
  state: { type: String, default: '89abca9877777777000000000000000000000000000000001111111123456432' },
  turn:  { type: Number, default: 0 }
});

var GameState = mongoose.model('GameState', Schema);

module.exports = {
  model:  GameState,
  schema: Schema
};
