var c = '../controllers/';
var a = c + 'api/';

var views = {
  index: require(c + 'index'),
  games: require(c + 'games'),
  turns: require(c + 'turns')
}

var api = {
  games: require(a + 'games')
}

module.exports = function(app) {
  app.all('/', views.index.index);

  app.get( '/games',     views.games.index);
  app.get( '/games/:id', views.games.show);
  app.post('/games',     views.games.create);

  app.get( '/games/:gameId/turns',     views.turns.index);
  app.get( '/games/:gameId/turns/:id', views.turns.show);
  app.post('/games/:gameId/turns/:id', views.turns.create);

  app.get( '/api/games/:gameId', api.games.show);
}
