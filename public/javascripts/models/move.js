var Move = Backbone.Model.extend({
  sync: function(method, model, options) {
    //Can't emit the model with the socket in it
    //It only lives for a single request, so this is ok
    var socket = model.get('socket');
    model.unset('socket');

    socket.emit('move', model);
  },

  url: function() {
    return '/api/games/' + this.get('gameId') + '/move';
  },

  promotion: function() {
    var piece = this.get('piece');
    if(piece.get('type') != 'pawn') {
      return false;
    }

    var to = this.get('to');

    //TODO: Need client Position model
    var lastRow;
    if(piece.get('color') == 'white') {
      lastRow = to >= 0 && to <= 7;
    } else {
      lastRow = to >= 56 && to <= 63;
    }

    return lastRow;
  }
});
