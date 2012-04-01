exports.index = function(req, res) {
  var gameId = req.params.gameId;
  res.send('all the turns for the ' + gameId + ' game!');
}

exports.show = function(req, res) {
  var gameId = req.params.gameId;
  var id = req.params.id;
  res.send('the ' + id + ' turn for the ' + gameId + ' game!');
}

exports.create = function(req, res) {
  var gameId = req.params.gameId;
  var id = 'newId'; 
  res.send('the new ' + id + ' turn for the ' + gameId + ' game!');
}
