var Game = Backbone.Model.extend({
  urlRoot: '/api/games',

  postFetch: function() {
    var states = [];
    var lastState;

    _.each(this.get('states'), function(state) {
      var gameState = new GameState(state);
      states.push(gameState);
      lastState = gameState;
    });
    this.set('states', states);

    lastState.render();
  },

  currentState: function() {
    return _.last(this.get('states'));
  },

  move: function(piece, to) {
    var move = new Move({
      gameId: this.id,
      from:   piece.get('position'),
      to:     to
    });

    var game = this;
    move.save({}, {
      success: function(move, res) {
        var state = new GameState(res.gameState);
        game.get('states').push(state);
        state.render();
      }
    });
  }

});
