var mongoose = require('mongoose');

var Schema = new mongoose.Schema({
  value: Number
});

Schema.statics.next = function(id, callback) {
  var query   = { _id: id };
  var sort    = [];
  var doc     = { $inc: { value: 1 } };
  var options = {
    'new':  true,
    upsert: true
  };

  this.collection.findAndModify(query, sort, doc, options, function(err, result) {
    callback(result.value);
  });
};

module.exports = mongoose.model('Counter', Schema);
