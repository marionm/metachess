var GameState = Backbone.Model.extend({
  initialize: function() {
    var state = this.get('state');

    var pieces = {};
    for(var i = 0; i < state.length; i++) {
      var piece = Piece.fromState(state, i);
      if(piece) {
        pieces[piece.cid] = piece;
      }
    }

    this.set('pieces', pieces);
  },

  getPiece: function(id) {
    return this.get('pieces')[id];
  },

  render: function(previousMove) {
    var pieces = this.get('pieces');

    var previousMoveIndexes = [];
    var previousMove = this.get('previousMove');
    if(previousMove && previousMove.length > 0) {
      previousMoveIndexes.push(previousMove[0].from);
      previousMoveIndexes.push(previousMove[0].to);
    }
    _.each(pieces, function(piece) {
      piece.render();
    });

    _.each($('.board .cell'), function(cell) {
      cell = $(cell);
      var hasPiece = _.any(pieces, function(piece) {
        return piece.get('position') == cell.data('index');
      });
      if(!hasPiece) {
        cell.children().remove();
      }

      Piece.deselectAll();

      cell.removeClass('previous-move');
      if(_.include(previousMoveIndexes, cell.data('index'))) {
        cell.addClass('previous-move');
      }
    });

    var whitesTurn = this.get('nextPlayer') == 'white';
    var status = $('#status');
    status.empty();
    if(_.size(this.get('validMoves')) == 0) {
      if(this.get('nextPlayerInCheck')) {
        var winner = whitesTurn ? 'Black' : 'White';
        status.append($('<span/>').addClass('checkmate').text(' - Checkmate, ' + winner + ' wins'));
      } else {
        status.append($('<span/>').addClass('stalemate').text(' - Stalemate'));
      }
    } else {
      var turn = whitesTurn ? "White's" : "Black's";
      status.append($('<span/>').text(' - ' + turn + ' turn'));
    }

    this.renderCurrentRules();
  },

  // TODO: Move rules to a separate model

  renderCurrentRules: function() {
    var currentRuleList = $($('#rules .current .list')[0]);
    currentRuleList.empty();
    _.each((this.get('enabledRules') || []), function(rule, i) {
      var currentRule = $('<span/>').text(rule.description)
      currentRule.addClass(rule.standard ? 'standard' : 'non-standard');
      currentRule.addClass(i % 2 == 0 ? 'even' : 'odd');
      currentRuleList.append($('<li/>').data('id', rule.id).append(currentRule));
    });
  },

  annotateRuleChanges: function(position) {
    this.removeRuleChangeAnnotations();

    var changeLists = $($('#rules .changes .list')[0]);

    var validMoves = this.get('validMoves');
    if(!validMoves) return;

    var label = 0;
    var annotations = [];

    _.each((validMoves[position] || []), function(validMove) {
      var ruleChanges = validMove.ruleChanges;
      var addedRules = ruleChanges.added;
      var removedRules = ruleChanges.removed;
      if(addedRules.length == 0 && removedRules.length == 0) return;

      var additions = [];
      _.each(addedRules, function(rule) {
        additions.push(rule.description);
      });
      var removals = [];
      _.each(removedRules, function(rule) {
        removals.push(rule.description);
      });

      var compare = function(a, b) {
        if(a.length != b.length) return false;
        for(var i = 0; i < a.length; i++) {
          if(a[i] != b[i]) return false;
        }
        return true;
      };
      var annotation = _.find(annotations, function(annotation) {
        return compare(annotation.additions, additions) && compare(annotation.removals, removals);
      });

      if(annotation) {
        annotation.indexes.push(validMove.index);
      } else {
        label = label + 1;
        annotations.push({
          indexes: [validMove.index],
          label: label,
          additions: additions,
          removals: removals
        });
      }
    });

    _.each(annotations, function(annotation) {
      _.each(annotation.indexes, function(index) {
        var cell = $('#cell' + index);
        cell.append($('<div/>').addClass('annotation').text(annotation.label));
      });

      var changeList = $('<ul/>');
      _.each(annotation.additions, function(addition) {
        changeList.append($('<li/>').addClass('added rule').text('+ ' + addition));
      });
      _.each(annotation.removals, function(removal) {
        changeList.append($('<li/>').addClass('removed rule').text('- ' + removal));
      });

      changeLists.append($('<li/>').text(label).append(changeList));
    });
  },

  removeRuleChangeAnnotations: function() {
    var changeLists = $($('#rules .changes .list')[0]);
    changeLists.empty();
    $('.cell .annotation').remove();
  }

});
