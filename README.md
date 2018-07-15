[![Build](https://travis-ci.org/arranstewart/urban-pancake.svg?branch=master)](https://travis-ci.org/arranstewart/urban-pancake)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## structure

see: <https://gist.github.com/tracker1/59f2c13044315f88bee9>

- `src/` is code that needs preprocessing
- `lib/` is code that runs as is

## quick usage

-   add `<script src="https://github.com/arranstewart/prop-parser-js/releases/download/v0.1.0/prop-parser.js"></script>`

## using in a client-side web page

-   download and untar (or, clone)
-   either: 

    -   add `<script src="dist/prop-parser.js"></script>`

    **or**: use in an npm project

    -   `$ npm init` \
        (to create a basic npm package)
    -   `$ npm install file:../path/to/prop-parser` \
        (should add it to your `package.json` file)
    -   Then bundle your code up with `browserify` or similar.

## API

-   `function parse(str)`: Attempts to parse **`str`** as a 
    propositional logic formula. Atomic statements are single capital
    letters ("`A`", "`B`", etc.). Logical connectives are any of:
    `^`, `v`, `~`, `->`, `<->`. Parentheses may be used for grouping.
    The string should have no starting or trailing whitespace.

    Returns a tree of `proptypes.Prop` objects on success, throws
    an exception on failure.

    Sample usage: `parse('A ^ B v C -> D <-> ~E')`

    For more examples of use, see `test/propgrammar.spec.js`.

-   `function asciify(str)`: Given a string with unicode connectives
    (e.g. found on `Prop` objects in their `text` property), convert
    them to the above ASCII representation.

### module `proptypes`

-   `class Prop`. Base class for proposition nodes.
    Subclasses intended to be instantiated are: `AtomicProp`, `NotProp`,
    `AndProp`, `OrProp`, `ImplProp`, `BiCondProp`.

-   `CompoundProp`. Base class for compound propositions.
    Subclasses are: `NotProp`, `AndProp`, `OrProp`, `ImplProp`,
    `BiCondProp`.

    Sample usage:

    ```
    const OrProp = proptypes.OrProp;
    const AtomicProp = proptypes.AtomicProp; 

    p = new OrProp(new AtomicProp("A"), new AtomicProp("B"));
    ```

    Child classes intended to be instantiated will have the following
    methods:

    -   `mkText()`: returns a string. Used internally for pretty-printing
        an instance.
    -   `symbol()`: returns a string, a Unicode symbol for that connective.

    Properties are:

    -   `text`: a string. Pretty-printed version of the proposition.
    -   `constructor.name`: a string. The class name for the instance
        (e.g. `AtomicProp` etc.)

    Class properties are:

    -   `name`: a string. The name of the class (e.g. `AtomicProp` etc.)


