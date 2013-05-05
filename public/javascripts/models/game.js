var Game = Backbone.Model.extend({
  urlRoot: '/api/games',

  initialize: function() {
    var endpoint = window.location.protocol + '//' + window.location.hostname;
    var socket = io.connect(endpoint);

    var game = this;
    var id = this.get('id');
    socket.on(id + 'moved', function(data) {
      //FIXME: Better error detection
      if(data == 'nope') {
        game.error(data);
      } else {
        game.success(data);
      }
    });

    socket.on(id + 'playerJoined', function(data) {
      if(data.type == 'white') {
        $('#whitePlayer').text('Playing');
      } else if(data.type == 'black') {
        $('#blackPlayer').text('Playing');
      } else {
        var spectatorCount = $('#spectatorCount');
        var count = parseInt(spectatorCount.text());
        if(isNaN(count)) {
          spectatorCount.text(1);
        } else {
          spectatorCount.text(count + 1);
        }
      }
    });

    socket.on(id + 'playerLeft', function(data) {
      if(data.type == 'white') {
        $('#whitePlayer').text('Not playing');
      } else if(data.type == 'black') {
        $('#blackPlayer').text('Not playing');
      } else {
        var spectatorCount = $('#spectatorCount');
        var count = parseInt(spectatorCount.text());
        if(isNaN(count)) {
          spectatorCount.text(0);
        } else {
          spectatorCount.text(count - 1);
        }
      }
    });


    socket.on('joined', function(data) {
      //FIXME: Really need a separate player model, and probably need to extract all socket interaction more cleanly
      game.set('player', {
        id:   data.player.id,
        type: data.player.type
      });

      if(data.currentPlayers) {
        if(data.currentPlayers.white) {
          $('#whitePlayer').text('Playing');
        }
        if(data.currentPlayers.black) {
          $('#blackPlayer').text('Playing');
        }
        if(data.currentPlayers.spectatorCount) {
          $('#spectatorCount').text(data.currentPlayers.spectatorCount);
        }
      }
    });

    socket.emit('join', { gameId: id });

    this.set('socket', socket);
  },

  success: function(res) {
    var state = new GameState(res.gameState);
    game.get('states').push(state);
    state.render();
  },

  error: function(res) {
    _.last(game.get('states')).render();
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

  move: function(piece, targetCell) {
    var move = new Move({
      gameId: this.id,
      piece:  piece,
      from:   piece.get('position'),
      to:     targetCell.data('index'),
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

          var newPiece = piece.clone();
          newPiece.set('type', type);
          game.preSaveMove(newPiece, targetCell);
          move.save();
        }
      });
    } else {
      game.preSaveMove(piece, targetCell);
      move.save();
    }

    var status = $('#status');
    status.empty();
    status.append($('<span/>').text(' - Loading...'));
  },

  preSaveMove: function(piece, targetCell) {
    piece.getCell().empty();
    targetCell.empty().append(piece.toHtml());
  }

});
