var GameState = Backbone.Model.extend({
  initialize: function() {
    var state = this.get('state');

    var pieces = {};
    for(var i = 0; i < state.length; i++) {
      var piece = Piece.fromState(state, i);
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
    var pieces = this.get('pieces');

    _.each(pieces, function(piece) {
      piece.render();
    });

    _.each($('.board .cell'), function(cell) {
      cell = $(cell);
      var hasPiece = _.any(pieces, function(piece) {
        return piece.get('position') == cell.data('index');
      });
      if(!hasPiece) {
        cell.children().remove();
      }
    });
  }

});
