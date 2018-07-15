
const proptypes   = require('../lib/proptypes');
const propgrammar = require('../lib/propgrammar');
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

global.parse     = parse
global.proptypes = proptypes
global.asciify   = proptypes.asciify

