var c = '../controllers/';

var index = require(c + 'index.js');
var games = require(c + 'games.js');
var turns = require(c + 'turns.js');

module.exports = function(app) {
  app.all('/', index.index);

  app.get( '/games',     games.index);
  app.get( '/games/:id', games.show);
  app.post('/games',     games.create);

  app.get( '/games/:gameId/turns',     turns.index);
  app.get( '/games/:gameId/turns/:id', turns.show);
  app.post('/games/:gameId/turns/:id', turns.create);
}
