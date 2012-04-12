var GameState = Backbone.Model.extend({
  initialize: function() {
    var pieces = [];
    var stateString = this.get('state');

    for(var i = 0; i < stateString.length; i++) {
      var piece = Piece.fromState(stateString, i);
      if(piece) {
        pieces.push(piece);
      }
    }

    this.set('pieces', pieces);
  },

  //TODO: Should be a backbone view probably, convert
  render: function() {
    _.each(this.get('pieces'), function(piece) {
      //TODO: Should be an underscore template
      var cell = $('#cell' + piece.get('cell'));
      cell.children().remove();
      cell.html('<div class="piece">' + piece.name() + '</div>');
    });

    $('.board .piece').draggable({
      stack:       '.board',
      containment: '.board',
      helper:      'clone',
      start: function() {
        $(this).parent().addClass('original');
      },
      stop: function() {
        $('.board .cell').removeClass('original');
        submitTurn(this);
      }
    });
  }

});
