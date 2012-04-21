var Move = Backbone.Model.extend({
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
