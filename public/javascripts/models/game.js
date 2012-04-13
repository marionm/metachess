var Game = Backbone.Model.extend({
  urlRoot: '/api/games',

  currentState: function() {
    var state = this.get('currentState');
    if(!state) {
      state = new GameState(_.last(this.get('states')));
      this.set('currentState', state);
    }
    return state;
  }
});
