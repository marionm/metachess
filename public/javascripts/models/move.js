var Move = Backbone.Model.extend({
  url: function() {
    return '/api/games/' + this.get('gameId') + '/move';
  }
});
