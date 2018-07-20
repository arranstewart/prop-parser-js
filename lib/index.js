
const proptypes   = require('./proptypes');
const propgrammar = require('./propgrammar');
const nearley     = require('nearley');

function parse (str) {
  var g = nearley.Grammar.fromCompiled(propgrammar)
  // grr. How to get parser to start on something other
  // than the default production is poorly documented.
  // But this is it.
  g.start = "logExpr" 
  var p = new nearley.Parser(g)
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
  'parse'     : parse,
  'global.asciify' : proptypes.asciify
};
