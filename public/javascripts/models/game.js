var Game = Backbone.Model.extend({
  urlRoot: '/api/games',

  currentState: function() {
    return new GameState(_.last(this.get('states')));
  },

  takeTurn: function(turn) {
    //TODO: Do this
  }
});
