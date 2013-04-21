//TODO: Modularize code
//TODO: Cells should be models

var prepareBoard = function() {
  cells = $('.board .cell');

  cells.click(function() {
    if(Piece.selected && $(this).hasClass('valid-mouseover')) {
      window.game.move(Piece.selected, $(this).data('index'));
    }
  });

  cells.droppable({
    hoverClass: 'piece-hover',
    drop: function(event, ui) {
      var cells = $('.board .cell');
      cells.removeClass('original');

      var pieceId = ui.draggable.data('piece-id');
      var piece = window.game.currentState().getPiece(pieceId);

      var currentPosition = piece.get('position');
      var toPosition = $(this).data('index');

      var validMoves = window.game.currentState().get('validMoves')[currentPosition];
      var valid = validMoves && _.contains(validMoves, toPosition);

      ui.draggable.draggable('option', 'revert', !valid);

      if(valid) {
        window.game.move(piece, toPosition);
        //TODO: Need to check that server says it's valid too
        return false;
      } else {
        $('.cell').removeClass('valid-drag');
      }
    }
  });
};

$(document).ready(function() {
  window.game.fetch({
    success: function() {
      //TODO: Why can't this be done from the model's initialize method?
      window.game.postFetch();

      window.game.currentState().render();
    }
  });

  prepareBoard();
});
