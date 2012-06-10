var mongoose = require('mongoose');
var counter = require('./counter');

module.exports = {
  next: function(callback) {
    counter.next('GameCounter', callback);
  }
};
