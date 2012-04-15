var Game = Backbone.Model.extend({
  urlRoot: '/api/games',

  currentState: function() {
    var state = this.get('currentState');
    if(!state) {
      state = new GameState(_.last(this.get('states')));
      this.set('currentState', state);
    }
    return state;
  },

  move: function(piece, to) {
    var move = new Move({
      gameId: this.id,
      from:   piece.get('position'),
      to:     to
    });

    var game = this;
    move.save({},{
      success: function(move, res) {
        game.get('states').push(new GameState(res.gameState));
        game.renderMove(new Move(res.move));
      }
    });
  },

  renderMove: function(move) {
    var cell = $('#cell' + move.get('from'));
    var pieceId = $(cell.children()[0]).data('piece-id');
    var piece = this.currentState().getPiece(pieceId);

    piece.animateMove(move);
  }

});
