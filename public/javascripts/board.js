//TODO: This is super temporary
var pieceMapping = {
  '0': {},
  '1': { name: 'Black Pawn' },
  '2': { name: 'Black Rook' },
  '3': { name: 'Black Knight' },
  '4': { name: 'Black Bishop' },
  '5': { name: 'Black Queen' },
  '6': { name: 'Black King' },
  '7': { name: 'White Pawn' },
  '8': { name: 'White Rook' },
  '9': { name: 'White Knight' },
  'a': { name: 'White Bishop' },
  'b': { name: 'White Queen' },
  'c': { name: 'White King' }
}

var prepareBoard = function() {
  $('.board .cell').droppable({
    hoverClass: 'piece-hover',
    drop: function(event, ui) {
      $(this).append($(ui.draggable));
    }
  });
};

var getInitialState = function() {
  //TODO: This sort of sucks
  var state = $('#currentState');
  return {
    state: $('#state', state).text(),
    turn:  $('#turn',  state).text()
  }
}

//TODO: Get backbone or something for client side modeling
//TODO: Get mustache or EJS for client side templating (and try to use the same server-side)
var renderState = function(state) {
  var stateString = state.state;
  $.each(stateString, function(i, c) {
    var cell = $('#cell' + i);
    cell.children().remove();

    if(c != 0) {
      cell.html('<div class="piece">' + pieceMapping[c].name + '</div>');
    }
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

var submitTurn = function(piece) {
  piece = $(piece);
  //TODO: Do this
}

$(document).ready(function() {
  var state = getInitialState();
  prepareBoard();
  renderState(state);
});
