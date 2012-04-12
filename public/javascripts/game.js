var prepareBoard = function() {
  $('.board .cell').droppable({
    hoverClass: 'piece-hover',
    drop: function(event, ui) {
      $(this).append($(ui.draggable));
    }
  });
};

var submitTurn = function(piece) {
  piece = $(piece);
  //TODO: Do this
}

$(document).ready(function() {
  window.game.fetch({
    success: function() {
      window.game.currentState().render();
    }
  });

  prepareBoard();
});
