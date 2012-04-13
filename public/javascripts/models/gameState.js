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

  //TODO: Should be a backbone view probably, convert
  render: function() {
    _.each(this.get('pieces'), function(piece) {
      //TODO: Should be an underscore template
      var cell = $('#cell' + piece.get('cell'));
      cell.children().remove();
      cell.html('<div id="piece' + piece.cid + '" class="piece" data-piece-id="' + piece.cid + '">' + piece.name() + '</div>');
    });

    var state = this;
    $('.board .piece').draggable({
      stack:       '.board',
      containment: '.board',
      helper:      'clone',
      start: function() {
        $(this).parent().addClass('original');
      }
    });
  }

});
