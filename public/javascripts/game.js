//TODO: Cells should be models, too? This is getting messy
var prepareBoard = function() {
  $('.board .cell').droppable({
    hoverClass: 'piece-hover',
    drop: function(event, ui) {
      //If invalid,
      // ui.draggable.draggable('option', 'revert', true);

      $('.board .cell').removeClass('original');

      var pieceId = ui.draggable.data('piece-id');
      var piece = window.game.currentState().getPiece(pieceId);

      var cell = $(this).data('index');

      var move = new Move({
        gameId: window.game.id,
        from:   piece.get('cell'),
        to:     cell
      });

      move.save(function() {
        $('#cell' + index).append($('#piece' + this.cid));
      });
    }

  });
};

$(document).ready(function() {
  window.game.fetch({
    success: function() {
      window.game.currentState().render();
    }
  });

  prepareBoard();
});
