exports.index = function(req, res) {
  var games = [{
    id: 1,
    name: 'Game 1'
  },{
    id: 2,
    name: 'Game 2'
  }];
  res.render('./games/index', {games: games});
}

exports.show = function(req, res) {
  var id = req.params.id;
  var game = {
    id:    id,
    name:  'Game ' + id
  };
  res.render('games/show', {
    stylesheets: ['compiled/board'],
    scripts: ['board'],
    game: game
  });
}

exports.create = function(req, res) {
  var id = req.params.id;
  res.send('the new ' + id + ' game!');
}
