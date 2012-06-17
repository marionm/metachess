//TODO: This doesn't feel like something that should be in mongo

var _ = require('underscore');
var mongoose = require('mongoose');

//Use ID for move/leaving validation to prevent client side type spoofing
var schema = new mongoose.Schema({
  gameId: String,
  type:   String  //Can be 'white', 'black', or 'spectator'
});

var next;
schema.statics.next = function(gameId, callback) {
  next(gameId, callback);
};

var CurrentPlayer = mongoose.model('CurrentPlayer', schema);

//FIXME: Is it necessary to set this up like this? Feels  both hacky and ugly
next = function(gameId, callback) {
  CurrentPlayer.find({ gameId: gameId }, function(err, players) {
    //TODO: Need a proper login system, really, it will simplify and make things better
    var white = _.any(players, function(p) { return p.type == 'white'; });
    var black = _.any(players, function(p) { return p.type == 'black'; });

    var type;
    if(white && black) {
      type = 'spectator';
    } else if(white) {
      type = 'black';
    } else {
      type = 'white';
    }

    var player = new CurrentPlayer({
      gameId: gameId,
      type:   type
    });

    player.save(function(err, p) {
      callback(p);
    });
  });
};

module.exports = CurrentPlayer;
