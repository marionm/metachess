## Metachess

Experimental node.js implementation of metachess, inspired by GEB.

### Prerequisites

1. node.js
1. npm
1. Mongo

### Setup

1. Clone repo and cd into it
1. `npm install`
1. `node metachess.js`

### Adding new rules

Create a new file under `models/ruleSets`, create an array of `Rule` objects, and export a `RuleSet`. Then, load and export the new `RuleSet` in `models/ruleSets.js`, and switch to it in `controllers/api/games.js`.

This obviously needs some improvements (like making the rule set a property of a game, and having a selector in the UI), but yeah.

### License

(The MIT License)

Copyright (c) 2013 Mike Marion

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
