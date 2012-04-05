var mongoose = require('mongoose');

var Game = mongoose.model('Game', new mongoose.Schema({
  state: { type: String, default: '2345643211111111000000000000000000000000000000007777777789abca98' },
  turn:  { type: Number, default: 0 }
}));

module.exports = Game;
