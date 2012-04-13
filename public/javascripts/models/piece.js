var Piece = Backbone.Model.extend({
  name: function() {
    return this.get('color') + ' ' + this.get('type');
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
      color: color,
      type:  type,
      cell:  index
    });
  }
});

