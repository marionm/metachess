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

      var toPosition = $(this).data('index');

      window.game.move(piece, toPosition);
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
