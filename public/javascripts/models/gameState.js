var GameState = Backbone.Model.extend({
  initialize: function() {
    var pieces = {};
    var stateString = this.get('state');

    for(var i = 0; i < stateString.length; i++) {
      var piece = Piece.fromState(stateString, i);
      if(piece) {
        pieces[piece.cid] = piece;
      }
    }

    this.set('pieces', pieces);
  },

  getPiece: function(id) {
    return this.get('pieces')[id];
  },

  render: function() {
    _.each(this.get('pieces'), function(piece) {
      piece.render();
    });
  }

});
