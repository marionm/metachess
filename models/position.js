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

Position.prototype.forward = function(color, count) {
  if(!count) count = 1;
  if(color == 'white') count *= -1;
  return new Position(this.row + count, this.col);
};

Position.prototype.backward = function(color, count) {
  if(!count) count = 1;
  if(color == 'white') count *= -1;
  return new Position(this.row - count, this.col);
};

Position.prototype.left = function(color, count) {
  if(!count) count = 1;
  return new Position(this.row, this.col - count);
};

Position.prototype.right = function(color, count) {
  if(!count) count = 1;
  return new Position(this.row, this.col + count);
};

Position.prototype.forwardLeft = function(color, fbCount, lrCount) {
  return this.forward(color, fbCount).left(lrCount);
};

Position.prototype.forwardRight = function(color, fbCount, lrCount) {
  return this.forward(color, fbCount).right(lrCount);
};

Position.prototype.backwardLeft = function(color, fbCount, lrCount) {
  return this.backward(color, fbCount).left(lrCount);
};

Position.prototype.backwardRight = function(color, fbCount, lrCount) {
  return this.backward(color, fbCount).right(lrCount);
};

Position.prototype.continuous = function(direction, color) {
  var positions = [];
  var next = this[direction](color);

  while(next.onBoard()) {
    positions.push(next);
    next = next[direction](color);
  };

  return positions;
};

module.exports = Position;
