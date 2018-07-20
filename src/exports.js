
const prop_parser = require('../lib/index.js');


global.parse     = prop_parser.parse
global.proptypes = prop_parser.proptypes
global.asciify   = prop_parser.proptypes.asciify

