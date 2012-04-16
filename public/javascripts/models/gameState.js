var GameState = Backbone.Model.extend({
  getPiece: function(id) {
    return this.get('pieces')[id];
  },

  render: function() {
    _.each(this.get('pieces'), function(piece) {
      piece.render();
    });
  }

});
