@{%

const prop = require("../lib/proptypes.js");
const moo = require("moo");

const lexer = moo.compile({
      WS:      { match: /[ \t\n\r]+/, lineBreaks: true },
      number:  /0|[1-9][0-9]*/,
      //string:  /"(?:\\["\\]|[^\n"\\])*"/,
      lparen:  '(',
      rparen:  ')',
      atom: /[A-Z]/,
      and: '^',
      not: '~',
      or: 'v',
      bicond: '<->',
      impl: '->'
    });

%}

@lexer lexer

@builtin "whitespace.ne" # `_` means arbitrary amount of whitespace
@builtin "number.ne"     # `int`, `decimal`, and `percentage` number primitives

# to get correct precedences, we do the "chaining" thing.
# biconditional has the lowest precedence, and is
# either a single logImplExpr, or a chain of logBiCondExpr.
#
# ... so the rule names aren't really an accurate reflection
# of what sort of _expression_ it is, rather what sort of
# expression has binding at that level of precedence.

logExpr -> logBiCondExpr
                   {% ([x]) => x  %}

logBiCondExpr -> logBiCondExpr _ %bicond _ logImplExpr
                  {% ([l, , , , r]) => new prop.BiCondProp(l,r)  %}
                | logImplExpr
                  {% ([x]) => x  %}

logImplExpr -> logImplExpr _ %impl _ logOrExpr
                  {% ([l, , , , r]) => new prop.ImplProp(l,r)  %}
                | logOrExpr
                  {% ([x]) => x  %}
 
logOrExpr -> logOrExpr _ %or _ logAndExpr
                  {% ([l, , , , r]) => new prop.OrProp(l,r)  %}
                | logAndExpr
                  {% ([x]) => x  %}

logAndExpr -> logAndExpr _ %and _ logNotExpr
                  {% ([l, , , , r]) => new prop.AndProp(l,r)  %}
             | logNotExpr
                  {% ([x]) => x  %}

logNotExpr -> %not _ logAtomExpr
                  {% ([ , ,c]) => new prop.NotProp(c)  %}
             | %not _ logNotExpr
                  {% ([ , ,c]) => new prop.NotProp(c)  %}
             | logAtomExpr
                  {% ([x]) => x  %}

logAtomExpr -> %atom {% ([x]) => new prop.AtomicProp(x.text) %}
        | %lparen _ logExpr _ %rparen
                   {% ([ , ,x, , ]) => x  %}
              

                




