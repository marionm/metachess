var Piece = Backbone.Model.extend({
  name: function() {
    return this.get('color') + ' ' + this.get('type');
  },

  getCell: function() {
    return $('#cell' + this.get('position'));
  },

  //TODO: The following methods probably belong in a view
  toHtml: function() {
    return '<div id="piece' + this.cid + '" class="piece" data-piece-id="' + this.cid + '">' + this.name() + '</div>';
  },

  render: function() {
    var cell = this.getCell();
    cell.children().remove();

    var current = $('#piece' + this.cid);
    if(current.length > 0) {
      cell.append(current);
    } else {
      cell.append(this.toHtml());
    }

    $(cell.children()[0]).draggable({
      stack:       '.board',
      containment: '.board',
      helper:      'clone',
      start: function() {
        cell.addClass('original');

        var validMoveMap = window.game.currentState().get('validMoves');
        if(validMoveMap) {
          var validMoves = validMoveMap[cell.data('index')] || [];
          _.each(validMoves, function(position) {
            $('#cell' + position).addClass('valid');
          });
        }
      }
    });
  },

  animateMove: function(move) {
    //TODO: Should animate
    this.set('position', move.get('to'));
    this.render();
  }

},{
  fromState: function(state, index) {
    var code = parseInt(state[index], 16);
    if(code == 0) return null;

    var color;
    if(code <= 6) {
      color = 'white';
    } else {
      color = 'black';
      code -= 6;
    }

    var type;
    switch(code) {
      case 1: type = 'pawn';   break;
      case 2: type = 'rook';   break;
      case 3: type = 'knight'; break;
      case 4: type = 'bishop'; break;
      case 5: type = 'queen';  break;
      case 6: type = 'king';   break;
      default: return null;
    }

    return new Piece({
      color:    color,
      type:     type,
      position: index
    });
  }
});

