'use strict'

const parser    = require('../lib/index.js');
const expect    = require('chai').expect;
const proptypes = parser.proptypes;
const jsc       = require('jsverify');

const Prop         = proptypes.Prop;
const CompoundProp = proptypes.CompoundProp;
const AtomicProp   = proptypes.AtomicProp;
const NotProp      = proptypes.NotProp;
const AndProp      = proptypes.AndProp;
const OrProp       = proptypes.OrProp;
const ImplProp     = proptypes.ImplProp;
const BiCondProp   = proptypes.BiCondProp;

// whether a string successfully parses
function doesParse (s) {
  try {
    parser.parse(s)
    return true
  } catch (err) {
    return false
  }
}


const expected_results = [
  [ 'A ^ B',    new AndProp( 
                    new AtomicProp('A'),
                    new AtomicProp('B')
                  ) ],

  [ 'A v (B)',    new OrProp( 
                    new AtomicProp('A'),
                    new AtomicProp('B')
                  ) ],

  [ '(~(~(G)))',  new NotProp(
                    new NotProp(
                      new AtomicProp('G')
                    )
                  ) ],

  [ '( H )^(O)', new AndProp(
                    new AtomicProp('H'),
                    new AtomicProp('O')
                 ) ],

  [ '(~(M)) ^ ( O )',
                 new AndProp(
                    new NotProp(
                      new AtomicProp('M')
                    ),
                    new AtomicProp('O')
                 ) ],
  [ '~~A',      new NotProp(
                  new NotProp(
                    new AtomicProp('A')
                  )
                ) ],

  [ '~~AvB',    new OrProp(
                  new NotProp(
                    new NotProp(
                      new AtomicProp('A')
                    )
                  ),
                  new AtomicProp('B')
               ) ],

  [ 'Av~~B',    new OrProp(
                  new AtomicProp('A'),
                  new NotProp(
                    new NotProp(
                      new AtomicProp('B')
                    )
                  )
               ) ],

  [ 'AvBvC',    new OrProp(
                  new OrProp(
                    new AtomicProp('A'),
                    new AtomicProp('B')
                  ),
                  new AtomicProp('C')
                )],

  [ 'AvB^C',    new OrProp(
                  new AtomicProp('A'),
                  new AndProp(
                    new AtomicProp('B'),
                    new AtomicProp('C')
                  )
                )]

]

const bad_strings = [
  '',
  ' ',
  '\t',
  '\n',
  'Av',
  '  A',
  '~',
  'A~B',
  'Bv',
  'vB',
  '()',
  'a',
  'z',
  '1',
  '@',
  'AA',
  'A   ', // exprs need to be rtrimmed
  '   A'  // and ltrimmed
]

// generators for use with jsverify

const arbUpperChar = 
      jsc.integer(65,90).smap(String.fromCharCode, (c)=>c.charCodeAt(0)); 

const arbBiConnective = jsc.elements(['^', 'v', '->', '<->'])

// lacks a proper right inverse (i.e. map from joined to unjoined)
// const arbSmallProp = jsc.tuple([arbUpperChar, arbBiConnective, arbUpperChar]).smap( ( x)=>x.join("") )
const arbSmallProp = jsc.bless({
  'generator':
      jsc.generator.combine(
          arbUpperChar.generator,
          arbBiConnective.generator,
          arbUpperChar.generator,
          (p1, conn, p2) => [p1, conn, p2].join('')
      )
})

// array of those weights.
// So, if you have a random number n from 0 to 1,
// you can just iterated through the weights and choose this
// arb if n < weights[idx].
//
// e.g.
//   xs = [ ["a", 3], ["b", 2], ["c", 7] ]
//   new_xs = normalise(xs)
//   // new_xs is: [0.25, 0.41666, 1]
//
// used in the proposition generator below.
function normalise (weightedArbs) {
  var weights = []
  var total = 0
  weightedArbs.forEach((x) => {
    total = total + x[1]
    weights.push(x[1])
  })

  var tmp = 0
  for (var i = 0; i < weights.length; i++) {
    var w = weights[i]
    var asFloat = w / total
    tmp = tmp + asFloat
    weights[i] = tmp
  }
  return weights
}

// combinator to make new jsc arbitraries out of a weighted
// list of old.
// takes an array of [ [arb1,weight], [arb2,weight] ... ]
// (where the weights are numbers, and can add up to anything
// postive.)
// returns a random result from one of those.
const weightedOneof = (weightedArbs) => jsc.bless({
  generator: (size) => {
    var normalised = normalise(weightedArbs)
    var r = jsc.random.number(0, 1)
    for (var i = 0; i < normalised.length; i++) {
      if (r < normalised[i]) {
        return weightedArbs[i][0].generator(size)
      }
    };
  }
})

// combinator for use in letrec:
// given "proposition" arbitrary from tie(),
// produce compound props.
const mkCompoundProp = (propArb) => jsc.bless({
  'generator':
    jsc.generator.combine(
      jsc.generator.small(jsc.generator.small(propArb.generator)),
      arbBiConnective.generator,
      jsc.generator.small(jsc.generator.small(propArb.generator)),
      (p1, conn, p2) => {
        if (p1.length != 1) {
          p1 = '(' + p1 + ')'
        }
        if (p2.length != 1) {
          p2 = '(' + p2 + ')'
        }
        return [p1, conn, p2].join('')
      }
    )
})

// combinator for use in letrec:
// given "proposition" arbitrary from tie(),
// produce compound props.
//
// not yet used 'cos pretty printing rules are fiddlly to reverse.
const mkNotProp = (propArb) => jsc.bless({
  'generator':
    jsc.generator.combine(
      propArb.generator,
      (p) => {
        if (p.match(/^~?[A-Z]$/) || p.match(/^~\(/)) {
          return '~' + p
        } else {
          return '~(' + p + ')'
        }
      }
    )
})

// use letrec to manage mutually recursive definitions
// for generators.
const moreArbs = jsc.letrec(function (tie) {
  return {
    atom: arbUpperChar,
    biProp: mkCompoundProp(tie('prop')),
    notProp: mkNotProp(tie('prop')),

    prop: weightedOneof([ [tie('atom'), 3],
                           [tie('biProp'), 1]
                           // [tie("notProp"),1]
    ])

  }
})

const arbProp = moreArbs["prop"];




// tests


describe('prop-parser', () => {
  describe('parse', () => {


    it('should parse AND', () => {

      var res = parser.parse('A ^ B');
      var expected = new AndProp( 
        new AtomicProp('A'),
        new AtomicProp('B')
      );
      expect( res ).to.deep.equal(expected);
    }),


    describe('should fail on bad strings', () => {

      for (var idx in bad_strings) {
        var input     = bad_strings[idx];
        var f         = function() { parser.parse(input) };
        
        it("should fail on " + JSON.stringify(input), () => {
          expect( f ).to.throw( );
        });
      }

    }),

    describe('should parse a bunch of other things', () => {
      for (var idx in expected_results) {
        var input     = expected_results[idx][0];
        var result    = parser.parse(input);
        var expected  = expected_results[idx][1];
        expect( result ).to.deep.equal( expected );

        it("should parse " + JSON.stringify(input), () => {
          expect( result ).to.deep.equal( expected );
        });

      }
    }),

    describe('successfully parses ...',()=>{

      jsc.property("single atoms", arbUpperChar, (c) => doesParse(c) );

      jsc.property("1-connective formulas", arbSmallProp, (c) => doesParse(c) );
      jsc.property("abritrary props with no not", arbProp, (s) => 
        doesParse(s)   
      );

    }),

    // only handles props w no not.
    describe('no-not props should roundtrip (modulo whitespace)',()=>{
      jsc.property("roundtrips", arbProp, (str) => {
        var parsed = parser.parse(str);
        var reStrung = proptypes.asciify( parsed.text )
                        .replace(/\s+/g, ""); 
        return str === reStrung;
      })
    })



  })
})
