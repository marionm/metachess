var Position = function(indexOrRow, col) {
  var row;
  var index;

  if(col || col == 0) {
    row = indexOrRow;
    index = (row - 1) * 8 + col - 1;
  } else {
    index = indexOrRow;
    row = Math.floor(index / 8) + 1;
    col = index % 8 + 1;
  }

  this.row = row;
  this.col = col;
  this.index = index;
};

Position.prototype.onBoard = function() {
  return this.row >= 1 && this.row <= 8 && this.col >= 1 && this.col <= 8;
};

//A bit odd that these are Position instance methods, but it's handy for the continuous method

Position.prototype.forward = function(piece, count) {
  if(!count) count = 1;
  if(piece.color == 'white') count *= -1;
  return new Position(this.row + count, this.col);
};

Position.prototype.backward = function(piece, count) {
  if(!count) count = 1;
  if(piece.color == 'white') count *= -1;
  return new Position(this.row - count, this.col);
};

Position.prototype.left = function(piece, count) {
  if(!count) count = 1;
  if(piece.color == 'black') count *= -1;
  return new Position(this.row, this.col - count);
};

Position.prototype.right = function(piece, count) {
  if(!count) count = 1;
  if(piece.color == 'black') count *= -1;
  return new Position(this.row, this.col + count);
};

Position.prototype.forwardLeft = function(piece, fCount, lCount) {
  return this.forward(piece, fCount).left(piece, lCount);
};

Position.prototype.forwardRight = function(color, fCount, rCount) {
  return this.forward(piece, fCount).right(piece, rCount);
};

Position.prototype.backwardLeft = function(piece, bCount, lCount) {
  return this.backward(piece, bCount).left(lCount);
};

Position.prototype.backwardRight = function(piece, bCount, rCount) {
  return this.backward(piece, bCount).right(piece, rCount);
};

Position.prototype.continuous = function(piece, direction) {
  var positions = [];
  var next = this[direction](piece);

  while(next.onBoard()) {
    positions.push(next);
    next = next[direction](piece);
  };

  return positions;
};

module.exports = Position;
