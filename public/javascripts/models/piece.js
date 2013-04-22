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

  isSelected: function() {
    return Piece.selected == this;
  },

  select: function() {
    Piece.deselectAll();
    Piece.selected = this;
    this.getCell().addClass('original');
    this.setValidCellClass('valid-mouseover');
    this.annotateRuleChanges();
  },

  setValidCellClass: function(cssClass) {
    var validMoveMap = window.game.currentState().get('validMoves');
    if(validMoveMap) {
      var validMoves = validMoveMap[this.getCell().data('index')] || [];
      _.each(validMoves, function(validMove) {
        $('#cell' + validMove.index).addClass(cssClass);
      });
    }
  },

  annotateRuleChanges: function() {
    var index = this.getCell().data('index');
    window.game.currentState().annotateRuleChanges(index);
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

    pieceDom.click(function() {
      // TODO: Total hack
      if(Piece.selected && cell.hasClass('valid-mouseover')) {
        cell.click();
      } else if(piece.isSelected()) {
        Piece.deselectAll();
      } else {
        piece.select();
      }
    });

    pieceDom.mouseover(function() {
      if(Piece.selected) return;
      piece.setValidCellClass('valid-mouseover');
      piece.annotateRuleChanges();
    });

    pieceDom.mouseout(function() {
      if(Piece.selected) return;
      $('.cell').removeClass('valid-mouseover');
      window.game.currentState().removeRuleChangeAnnotations();
    });

    pieceDom.draggable({
      stack:       '.board',
      containment: '.board',
      helper:      'clone',
      start: function() {
        Piece.deselectAll();
        pieceDom.hide();
        cell.addClass('original');
        piece.setValidCellClass('valid-drag');
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
  deselectAll: function() {
    Piece.selected = null;
    $('.cell').removeClass('original').removeClass('valid-mouseover');
    window.game.currentState().removeRuleChangeAnnotations();
  },

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

