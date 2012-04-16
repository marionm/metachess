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

    var stateString = lastState.get('state');

    var pieces = {};

    for(var i = 0; i < stateString.length; i++) {
      var piece = Piece.fromState(stateString, i);
      if(piece) {
        pieces[piece.cid] = piece;
      }
    }

    this.set('pieces', pieces);
    lastState.set('pieces', pieces);
  },

  getPiece: function(id) {
    return this.get('pieces')[id];
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
    move.save({},{
      success: function(move, res) {
        var gameState = new GameState(res.gameState);
        gameState.set('pieces', game.get('pieces'));
        game.get('states').push(gameState);
        game.renderMove(new Move(res.move));
      }
    });
  },

  renderMove: function(move) {
    var cell = $('#cell' + move.get('from'));
    var pieceId = $(cell.children()[0]).data('piece-id');
    var piece = this.getPiece(pieceId);

    piece.animateMove(move);
  }

});
