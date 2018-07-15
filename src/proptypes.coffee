###*  
 *
 * Classes which represents nodes in an abstract syntax tree
 * for propositional logic formulas.
 *
 * @module
###

# just here to get comments in generated javascript to
# attach properly
class x

###*
 * Convert a string containing unicode connectives into ASCII
###
asciify = (str) -> 
  str.replace(/\u00AC/g, "~")
     .replace(/\u2227/g, "^")
     .replace(/\u2228/g, "v")
     .replace(/\u2192/g, "->")
     .replace(/\u2194/g, "<->")


###* 
 * Base clase for propositions.
 * 
 * Child classes intended to be instantiated will have
 * a 'mkText' method, for pretty-printing an instance.
 *
 * Connectives also get
 * a `symbol` method, which gives a (usually Unicode)
 * symbol for that connective.
 *
 * @class
###
class Prop

class CompoundProp extends Prop
  constructor: (children) -> 
    @.children = children
    @.text = @.mkText()

  symbol : () -> throw "CompoundProp has no symbol"


  ###* Pretty-print the proposition as a formula.
   * Recurse over children, and put brackets around compound
   * propositions.
  ###  
  mkText : () ->
    childParenText = (child) ->
      if child instanceof CompoundProp && child.children.length > 1 
        "(" + child.mkText() + ")"
      else
        child.mkText()

    (childParenText(child) for child in @.children).join( " " + @.symbol() + " " )


class AtomicProp extends Prop
  constructor: (char) ->
    @name = char
    @.text = @.mkText()

  @default: ->
    new AtomicProp('A')

  mkText: () -> @.name


class NotProp extends CompoundProp
  constructor: (child) ->
    super([child]) 

  @default: ->
    new NotProp(new AtomicProp('N'))

  symbol: () -> "\u00AC" # "~"

  mkText: () ->
    child = @.children[0]
    if child instanceof CompoundProp
        @.symbol() + "(" + child.mkText() + ")"
    else
      @.symbol() + @.children[0].mkText()

class AndProp extends CompoundProp
  constructor: (lchild, rchild) ->
    super([lchild, rchild])

  @default: ->
    new AndProp(new AtomicProp('L'), new AtomicProp('R'))

  symbol: () -> "\u2227" # "^"

class OrProp extends CompoundProp
  constructor: (lchild, rchild) ->
    super([lchild, rchild])

  @default: ->
    new OrProp(new AtomicProp('L'), new AtomicProp('R'))

  symbol: () -> "\u2228" # "v"

class ImplProp extends CompoundProp
  constructor: (lchild, rchild) ->
    super([lchild, rchild])

  @default: ->
    new ImplProp(new AtomicProp('L'), new AtomicProp('R'))

  symbol: () -> "\u2192" # "->"

class BiCondProp extends CompoundProp
  constructor: (lchild, rchild) ->
    super([lchild, rchild])

  @default: ->
    new BiCondProp(new AtomicProp('L'), new AtomicProp('R'))

  symbol: () -> "\u2194" # "<->"


module.exports = 
  Prop          : Prop
  CompoundProp  : CompoundProp
  AtomicProp    : AtomicProp
  NotProp       : NotProp
  AndProp       : AndProp
  OrProp        : OrProp
  ImplProp      : ImplProp
  BiCondProp    : BiCondProp
  asciify       : asciify



