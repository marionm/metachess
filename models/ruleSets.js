var _  = require('underscore');
var fs = require('fs');

var dir = __dirname + '/ruleSets';
var ruleSets = {};
_.each(fs.readdirSync(dir), function(file) {
  var ruleSet = require(dir + '/' + file).ruleSet;
  if(ruleSet.id == 'metachess-standard') {
    ruleSet.default = true;
  }
  ruleSets[ruleSet.id] = ruleSet;
});

module.exports = {
  ruleSets: ruleSets,
  get: function(id) {
    return ruleSets[id];
  }
};
