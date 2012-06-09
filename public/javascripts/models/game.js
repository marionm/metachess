var Game = Backbone.Model.extend({
  urlRoot: '/api/games',

  initialize: function() {
    var endpoint = window.location.protocol + '//' + window.location.hostname;
    var socket = io.connect(endpoint);;

    var game = this;
    socket.on(this.get('id'), function(data) {
      //FIXME: Better error detection
      if(data != 'nope') {
        game.success(data);
      }
    });

    this.set('socket', socket);
  },

  success: function(res) {
    var state = new GameState(res.gameState);
    game.get('states').push(state);
    state.render();
  },

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
      piece:  piece,
      from:   piece.get('position'),
      to:     to,
      socket: this.get('socket')
    });

    var game = this;

    if(move.promotion()) {
      showDialog('#promotionDialog', 'Promote pawn to...', {
        'Cancel': function() {
          $(this).dialog('close');
        },
        'Ok': function() {
          $(this).dialog('close');

          var type = $('input:checked', this).val();
          move.set('promoteTo', type);

          move.save();
        }
      });
    } else {
      move.save();
    }
  }

});
