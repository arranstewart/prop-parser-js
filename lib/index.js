
const proptypes   = require('./proptypes');
const propgrammar = require('./propgrammar');
const nearley     = require('nearley');

function parse (str) {
  var p = new nearley.Parser(nearley.Grammar.fromCompiled(propgrammar))
  p.feed(str)
  var res = p.results
  if (res.length == 0) {
    throw 'Need more input - did you forget to finish the proposition?'
  }
  // console.log("no. of parse trees: " + res.length);
  return res[0]
}

module.exports = {
  'proptypes' : proptypes,
  'parse'     : parse
};
