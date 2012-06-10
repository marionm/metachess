var Piece = Backbone.Model.extend({
  getCell: function() {
    return $('#cell' + this.get('position'));
  },

  //TODO: The following methods probably belong in a view
  toHtml: function() {
    var id = 'piece' + this.cid;
    var css = 'piece ' + this.get('color') + ' ' + this.get('type');
    return '<div id="' + id + '" class="' + css + '" data-piece-id="' + this.cid + '"></div>';
  },

  setValidCellClass: function(currentCell, cssClass) {
    var validMoveMap = window.game.currentState().get('validMoves');
    if(validMoveMap) {
      var validMoves = validMoveMap[currentCell.data('index')] || [];
      _.each(validMoves, function(position) {
        $('#cell' + position).addClass(cssClass);
      });
    }
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

    var pieceDom = $(cell.children()[0]);
    var piece = this;

    pieceDom.mouseover(function() {
      piece.setValidCellClass(cell, 'valid-mouseover');
    });

    pieceDom.mouseout(function() {
      $('.cell').removeClass('valid-mouseover');
    });

    pieceDom.draggable({
      stack:       '.board',
      containment: '.board',
      helper:      'clone',
      start: function() {
        pieceDom.hide();
        cell.addClass('original');
        piece.setValidCellClass(cell, 'valid-drag');
      },
      stop: function() {
        pieceDom.show();
        $('.cell').removeClass('valid-drag');
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

