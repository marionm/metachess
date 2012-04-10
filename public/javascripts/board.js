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

var getInitialState = function() {
  //TODO: This sort of sucks
  var state = $('#currentState');
  return {
    state: $('#state', state).text(),
    turn:  $('#turn',  state).text()
  }
}

var renderState = function(state) {
  var stateString = state.state;
  //TODO: Get backbone or something for client side modeling
  $.each(stateString, function(i, c) {
    $('#cell' + i).text(pieceMapping[c].name);
  });
}

$(document).ready(function() {
  var state = getInitialState();
  renderState(state);
});
