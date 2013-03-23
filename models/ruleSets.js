// TODO: Iterate over the contents of the folder
var dir = './ruleSets';
module.exports = {
  standard: require(dir + '/standard').ruleSet
};
