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
