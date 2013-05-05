# Metachess

Experimental node.js implementation of metachess, inspired by GEB.

### Rules

The game starts with the standard set of chess rules, but rules may be added or removed as the game progresses. The default rules:

* Knight on the A or H file = Queens move like kings
* Bishop on its opponent's back rank = Knights can move in a 2-by-2 L shape, but not the standard shape
* Rook on its opponent's back rank = Knights can move in a 3-by-1 L shape, but not the standard shape
* Queen on its opponent's back rank = Pawns move and attack backwards
  * Pawns cannot be promoted on their own back rank
  * Pawns can _always_ move two spaces forward from their starting rank
* King in one of the four center-most positions = Bishop and rook movement rules are swapped
* King in one of the board's corners = Knights can wrap around the board

### Local setup

1. Install node.js, npm, and MongoDB
1. Clone the repo and `cd` into it
1. `npm install`
1. `node metachess.js`
1. Hit localhost:3000 in your browser

### Adding a new rule set

Create a new file under `models/ruleSets`, create an array of `Rule` objects, and export a `RuleSet`.

A good example is `models/ruleSets/metachessStandard.js`.

### License

(The MIT License)

Copyright (c) 2013 Mike Marion

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
