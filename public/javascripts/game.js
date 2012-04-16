//TODO: Cells should be models, too? This is getting messy
var prepareBoard = function() {
  $('.board .cell').droppable({
    hoverClass: 'piece-hover',
    drop: function(event, ui) {
      var valid = $(this).hasClass('valid');

      var cells = $('.board .cell');
      cells.removeClass('original');
      cells.removeClass('valid');

      ui.draggable.draggable('option', 'revert', !valid);

      if(valid) {
        var pieceId = ui.draggable.data('piece-id');
        var piece = window.game.currentState().getPiece(pieceId);

        var toPosition = $(this).data('index');

        window.game.move(piece, toPosition);
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
